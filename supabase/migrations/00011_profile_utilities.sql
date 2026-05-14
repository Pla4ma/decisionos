-- Migration: Profile counter utilities and review tracking

-- RPC: Increment profile counters (decisions_made, reviews_completed, etc.)
CREATE OR REPLACE FUNCTION increment_profile_counter(
  p_user_id UUID,
  p_counter TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    CASE p_counter
      WHEN 'total_decisions_made' THEN total_decisions_made = COALESCE(total_decisions_made, 0) + 1
      WHEN 'total_reviews_completed' THEN total_reviews_completed = COALESCE(total_reviews_completed, 0) + 1
    END,
    last_active_date = CURRENT_DATE,
    decision_consistency_days = (
      SELECT COUNT(DISTINCT updated_at::date)
      FROM (
        SELECT updated_at FROM decisions WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM decision_reviews WHERE user_id = p_user_id
      ) t
      WHERE updated_at::date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Update regret rate on review
CREATE OR REPLACE FUNCTION update_regret_rate(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total INTEGER;
  v_regretted INTEGER;
  v_rate NUMERIC(5,2);
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE would_choose_same = false)
  INTO v_total, v_regretted
  FROM decision_reviews
  WHERE user_id = p_user_id AND would_choose_same IS NOT NULL;

  IF v_total > 0 THEN
    v_rate := (v_regretted::NUMERIC / v_total) * 100;
  END IF;

  UPDATE profiles SET
    regret_rate = v_rate,
    total_reviews_completed = COALESCE(total_reviews_completed, 0) + 1,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Update avg decision hours on review
CREATE OR REPLACE FUNCTION update_avg_decision_hours(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_avg NUMERIC(10,1);
BEGIN
  SELECT AVG(created_to_decided_hours)::NUMERIC(10,1)
  INTO v_avg
  FROM decision_velocity
  WHERE user_id = p_user_id AND created_to_decided_hours IS NOT NULL;

  UPDATE profiles SET
    avg_decision_hours = v_avg,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

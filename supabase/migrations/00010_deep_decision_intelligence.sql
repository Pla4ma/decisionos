-- Migration: Deep Decision Intelligence Systems
-- Replaces gamification bloat with meaningful decision intelligence:
-- Regret Forecast, Future Self, Decision Velocity, Blind Spots, Decision Playbook

-- ============================================================
-- TABLE 1: decision_velocity — Track decision timing vs outcome quality
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_velocity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_to_decided_hours INTEGER, -- hours from creation to choosing
  decided_to_reviewed_hours INTEGER, -- hours from choosing to reviewing
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  would_choose_same BOOLEAN,
  velocity_tier TEXT CHECK (velocity_tier IN ('rushed', 'quick', 'moderate', 'deliberate', 'slow')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE decision_velocity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own velocity"
  ON decision_velocity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own velocity"
  ON decision_velocity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX decision_velocity_user_id_idx ON decision_velocity(user_id);

-- ============================================================
-- TABLE 2: user_blind_spots — Detected recurring decision biases
-- ============================================================
CREATE TABLE IF NOT EXISTS user_blind_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blind_spot_type TEXT NOT NULL CHECK (blind_spot_type IN (
    'overoptimism', 'loss_aversion', 'confirmation_bias', 'sunk_cost',
    'overconfidence', 'anchoring', 'urgency_bias', 'social_pressure',
    'analysis_paralysis', 'impulsivity', 'status_quo_bias', 'recency_bias'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_count INTEGER NOT NULL DEFAULT 1,
  evidence_decision_ids UUID[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'significant')),
  first_detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_detected_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blind_spot_type)
);

ALTER TABLE user_blind_spots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own blind spots"
  ON user_blind_spots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own blind spots"
  ON user_blind_spots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own blind spots"
  ON user_blind_spots FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX user_blind_spots_user_id_idx ON user_blind_spots(user_id);

-- ============================================================
-- TABLE 3: decision_playbooks — Auto-generated personal decision guides
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Your Decision Playbook',
  strengths JSONB NOT NULL DEFAULT '[]',     -- [{title, description, confidence}]
  weaknesses JSONB NOT NULL DEFAULT '[]',    -- [{title, description, impact}]
  biases JSONB NOT NULL DEFAULT '[]',        -- [{type, title, description}]
  optimal_speed TEXT,                        -- e.g. "You decide best when you take 2-3 days"
  strongest_categories JSONB DEFAULT '[]',   -- [{category, avg_satisfaction}]
  growth_areas JSONB DEFAULT '[]',           -- [{category, suggestion}]
  regret_pattern TEXT,                       -- Summary of what causes regret
  decision_philosophy TEXT,                  -- Auto-generated personal philosophy
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  review_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE decision_playbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own playbook"
  ON decision_playbooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playbook"
  ON decision_playbooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playbook"
  ON decision_playbooks FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX decision_playbooks_user_id_idx ON decision_playbooks(user_id);

-- ============================================================
-- TABLE 4: decision_forecasts — AI predictions stored before decision is made
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  regret_forecast JSONB NOT NULL,            -- [{option_id, regret_likelihood, why, what_would_cause_regret}]
  future_self_letters JSONB NOT NULL,        -- [{option_id, letter_text, perspective}]
  blind_spot_alerts JSONB DEFAULT '[]',      -- [{blind_spot_type, description, relevant_to_option}]
  confidence_timeline JSONB DEFAULT '{}',    -- {immediate: x, short_term: y, long_term: z}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE decision_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own forecasts"
  ON decision_forecasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own forecasts"
  ON decision_forecasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX decision_forecasts_decision_id_idx ON decision_forecasts(decision_id);

-- ============================================================
-- TABLE 5: prediction_accuracy — Track how well AI predictions matched reality
-- ============================================================
CREATE TABLE IF NOT EXISTS prediction_accuracy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forecast_id UUID NOT NULL REFERENCES decision_forecasts(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  regret_accuracy INTEGER CHECK (regret_accuracy >= 0 AND regret_accuracy <= 100),
  satisfaction_predicted INTEGER,
  satisfaction_actual INTEGER,
  did_regret BOOLEAN,
  was_regret_predicted BOOLEAN,
  analysis_accuracy INTEGER CHECK (analysis_accuracy >= 0 AND analysis_accuracy <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prediction_accuracy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own prediction accuracy"
  ON prediction_accuracy FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prediction accuracy"
  ON prediction_accuracy FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX prediction_accuracy_user_id_idx ON prediction_accuracy(user_id);
CREATE INDEX prediction_accuracy_decision_id_idx ON prediction_accuracy(decision_id);

-- ============================================================
-- Modify profiles: simpler tracking
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS total_decisions_made INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS regret_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS avg_decision_hours NUMERIC(10,1),
  ADD COLUMN IF NOT EXISTS decision_consistency_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- ============================================================
-- RPC: Detect blind spots from reviewed decisions
-- ============================================================
CREATE OR REPLACE FUNCTION detect_user_blind_spots(p_user_id UUID)
RETURNS TABLE (
  blind_spot_type TEXT,
  title TEXT,
  description TEXT,
  evidence_count INTEGER,
  severity TEXT
) AS $$
DECLARE
  v_review_count INTEGER;
  v_avg_satisfaction NUMERIC;
  v_would_not_choose_pct NUMERIC;
  v_quick_decisions_pct NUMERIC;
  v_high_importance_low_sat_count INTEGER;
  v_consistent_low_sat_category TEXT;
BEGIN
  -- Count reviews
  SELECT COUNT(*), AVG(satisfaction_score)::NUMERIC(10,2)
  INTO v_review_count, v_avg_satisfaction
  FROM decision_reviews WHERE user_id = p_user_id AND satisfaction_score IS NOT NULL;

  IF v_review_count < 3 THEN RETURN; END IF;

  -- Would NOT choose same percentage
  SELECT CASE WHEN COUNT(*) > 0
    THEN (COUNT(*) FILTER (WHERE would_choose_same = false) * 100.0 / COUNT(*))
    ELSE 0 END
  INTO v_would_not_choose_pct
  FROM decision_reviews WHERE user_id = p_user_id AND would_choose_same IS NOT NULL;

  -- Quick decisions (made in < 2 hours) percentage
  SELECT CASE WHEN COUNT(*) > 0
    THEN (COUNT(*) FILTER (WHERE created_to_decided_hours < 2) * 100.0 / COUNT(*))
    ELSE 0 END
  INTO v_quick_decisions_pct
  FROM decision_velocity WHERE user_id = p_user_id AND satisfaction_score IS NOT NULL;

  -- High importance decisions with low satisfaction
  SELECT COUNT(*) INTO v_high_importance_low_sat_count
  FROM decision_velocity dv
  JOIN decisions d ON d.id = dv.decision_id
  WHERE dv.user_id = p_user_id
    AND dv.satisfaction_score < 3
    AND d.importance >= 7;

  -- BLIND SPOT: Overoptimism (consistent overestimation)
  IF v_would_not_choose_pct > 40 THEN
    RETURN QUERY SELECT 'overoptimism', 'Overoptimism Bias',
      'In ' || ROUND(v_would_not_choose_pct)::TEXT || '% of reviewed decisions, you would choose differently now. You may be overestimating how well options will work out.',
      v_review_count, 'significant';
  END IF;

  -- BLIND SPOT: Impulsivity (rushing decisions)
  IF v_quick_decisions_pct > 50 AND v_avg_satisfaction < 3.5 THEN
    RETURN QUERY SELECT 'impulsivity', 'Impulsive Decision-Making',
      'You make most decisions quickly (under 2 hours) but satisfaction is below average (' ||
      ROUND(v_avg_satisfaction, 1)::TEXT || '/5). You may benefit from slowing down on important choices.',
      v_review_count, 'significant';
  END IF;

  -- BLIND SPOT: Analysis paralysis (slow but still unsatisfied)
  IF v_quick_decisions_pct < 20 AND v_avg_satisfaction < 3.5 THEN
    RETURN QUERY SELECT 'analysis_paralysis', 'Analysis Paralysis',
      'You take time with decisions but still report below-average satisfaction (' ||
      ROUND(v_avg_satisfaction, 1)::TEXT || '/5). More analysis may not be helping — trust your gut more.',
      v_review_count, 'moderate';
  END IF;

  -- BLIND SPOT: Urgency bias (high urgency decisions regretted)
  IF v_high_importance_low_sat_count >= 2 THEN
    RETURN QUERY SELECT 'urgency_bias', 'Urgency Bias',
      'High-stakes decisions made under urgency tend to underperform. When importance is 7+ and urgency is high, slow down.',
      v_high_importance_low_sat_count, 'significant';
  END IF;

  -- BLIND SPOT: Status quo (consistently choosing safe options, moderate satisfaction)
  IF v_would_not_choose_pct > 25 AND v_would_not_choose_pct < 40 THEN
    RETURN QUERY SELECT 'status_quo_bias', 'Status Quo Bias',
      'You sometimes regret playing it safe. Some of your best outcomes may come from bolder choices.',
      v_review_count, 'mild';
  END IF;

  -- Confidence-based insight
  IF v_avg_satisfaction > 3.8 THEN
    RETURN QUERY SELECT 'overconfidence', 'Healthy Decision Confidence',
      'Your decisions are working well overall (' || ROUND(v_avg_satisfaction, 1)::TEXT ||
      '/5 avg satisfaction). Keep trusting your process — it is serving you.',
      v_review_count, 'mild';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Calculate decision velocity tier
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_velocity_tier(p_hours NUMERIC, p_satisfaction INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_hours < 1 THEN RETURN 'rushed'; END IF;
  IF p_hours < 24 THEN
    IF p_satisfaction >= 4 THEN RETURN 'quick';
    ELSE RETURN 'rushed'; END IF;
  END IF;
  IF p_hours < 72 THEN
    IF p_satisfaction >= 3 THEN RETURN 'moderate';
    ELSE RETURN 'quick'; END IF;
  END IF;
  IF p_hours < 168 THEN RETURN 'deliberate'; END IF;
  RETURN 'slow';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- RPC: Generate decision playbook from user data
-- ============================================================
CREATE OR REPLACE FUNCTION generate_decision_playbook(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_decisions INTEGER;
  v_total_reviews INTEGER;
  v_avg_satisfaction NUMERIC(10,2);
  v_regret_rate NUMERIC(10,2);
  v_optimal_hours NUMERIC(10,1);
  v_blind_spots JSONB;
  v_best_category TEXT;
  v_strengths JSONB := '[]';
  v_weaknesses JSONB := '[]';
  v_biases JSONB := '[]';
BEGIN
  -- Aggregate stats
  SELECT COUNT(*) INTO v_total_decisions FROM decisions WHERE user_id = p_user_id;
  SELECT COUNT(*), AVG(satisfaction_score)::NUMERIC(10,2)
  INTO v_total_reviews, v_avg_satisfaction
  FROM decision_reviews WHERE user_id = p_user_id AND satisfaction_score IS NOT NULL;

  IF v_total_reviews < 5 THEN
    RETURN jsonb_build_object(
      'ready', false,
      'message', 'Complete at least 5 outcome reviews to unlock your Decision Playbook.',
      'reviews_needed', 5 - v_total_reviews
    );
  END IF;

  -- Regret rate
  SELECT CASE WHEN COUNT(*) > 0
    THEN (COUNT(*) FILTER (WHERE would_choose_same = false) * 100.0 / COUNT(*))
    ELSE 0 END INTO v_regret_rate
  FROM decision_reviews WHERE user_id = p_user_id AND would_choose_same IS NOT NULL;

  -- Optimal decision speed (hours with best satisfaction)
  SELECT AVG(created_to_decided_hours)
  INTO v_optimal_hours
  FROM decision_velocity
  WHERE user_id = p_user_id AND satisfaction_score >= 4
  LIMIT 10;

  -- Best category
  SELECT d.category INTO v_best_category
  FROM decision_reviews r
  JOIN decisions d ON d.id = r.decision_id
  WHERE r.user_id = p_user_id AND r.satisfaction_score IS NOT NULL
  GROUP BY d.category
  ORDER BY AVG(r.satisfaction_score) DESC
  LIMIT 1;

  -- Active blind spots
  SELECT jsonb_agg(jsonb_build_object(
    'type', blind_spot_type,
    'title', title,
    'description', description,
    'severity', severity
  )) INTO v_biases
  FROM user_blind_spots
  WHERE user_id = p_user_id AND is_active = true AND severity IN ('significant', 'moderate');

  -- Build strengths
  IF v_avg_satisfaction >= 4.0 THEN
    v_strengths = v_strengths || jsonb_build_object(
      'title', 'High Decision Satisfaction',
      'description', 'You rate your decisions ' || ROUND(v_avg_satisfaction, 1)::TEXT || '/5 on average. Your process works.',
      'confidence', 85
    );
  END IF;

  IF v_regret_rate < 20 THEN
    v_strengths = v_strengths || jsonb_build_object(
      'title', 'Low Regret Rate',
      'description', 'Only ' || ROUND(v_regret_rate)::TEXT || '% of decisions you would change. Strong conviction.',
      'confidence', 80
    );
  END IF;

  -- Build weaknesses
  IF v_regret_rate > 30 THEN
    v_weaknesses = v_weaknesses || jsonb_build_object(
      'title', 'Above-Average Regret',
      'description', ROUND(v_regret_rate)::TEXT || '% regret rate. Consider more structured reflection before committing.',
      'impact', 'High'
    );
  END IF;

  -- Upsert playbook
  INSERT INTO decision_playbooks (
    user_id, version, strengths, weaknesses, biases, optimal_speed,
    strongest_categories, regret_pattern,
    decision_philosophy, review_count, is_published
  ) VALUES (
    p_user_id, 1,
    v_strengths, v_weaknesses, COALESCE(v_biases, '[]'),
    CASE WHEN v_optimal_hours IS NOT NULL
      THEN 'You decide best when you take about ' || ROUND(v_optimal_hours)::TEXT || ' hours'
      ELSE NULL END,
    CASE WHEN v_best_category IS NOT NULL
      THEN jsonb_build_array(jsonb_build_object('category', v_best_category, 'avg_satisfaction', v_avg_satisfaction))
      ELSE '[]' END,
    CASE
      WHEN v_regret_rate < 15 THEN 'You rarely regret your choices. Keep trusting your instincts.'
      WHEN v_regret_rate > 30 THEN 'Rushed or high-pressure decisions tend to generate the most regret.'
      ELSE 'You have a balanced relationship with your choices.'
    END,
    'Based on ' || v_total_reviews::TEXT || ' reviewed decisions',
    v_total_reviews, true
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    version = decision_playbooks.version + 1,
    strengths = EXCLUDED.strengths,
    weaknesses = EXCLUDED.weaknesses,
    biases = EXCLUDED.biases,
    optimal_speed = EXCLUDED.optimal_speed,
    strongest_categories = EXCLUDED.strongest_categories,
    regret_pattern = EXCLUDED.regret_pattern,
    decision_philosophy = EXCLUDED.decision_philosophy,
    review_count = EXCLUDED.review_count,
    is_published = true,
    updated_at = NOW();

  RETURN jsonb_build_object('ready', true, 'playbook_generated', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

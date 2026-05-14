-- Migration: CBMI (Cognitive Bias Mitigation Index) & Bias Tracking
-- Phase 3: Identity/Progression — Replaces generic streaks with bias-specific metrics
-- Tracks every bias detection, mitigation action, and computes a rationality score

-- ============================================================
-- TABLE 1: bias_detection_events — Every bias ever detected for a user
-- ============================================================
CREATE TABLE IF NOT EXISTS bias_detection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
  bias_name TEXT NOT NULL,
  description TEXT,
  context_excerpt TEXT,
  mitigation_strategy TEXT,
  was_acknowledged BOOLEAN DEFAULT FALSE,
  was_mitigated BOOLEAN DEFAULT FALSE,
  mitigated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bias_detection_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bias events"
  ON bias_detection_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bias events"
  ON bias_detection_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bias events"
  ON bias_detection_events FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX bias_detection_events_user_id_idx ON bias_detection_events(user_id);
CREATE INDEX bias_detection_events_bias_name_idx ON bias_detection_events(bias_name);
CREATE INDEX bias_detection_events_created_at_idx ON bias_detection_events(created_at);

-- ============================================================
-- TABLE 2: user_cbmi_scores — Weekly snapshots of CBMI score
-- ============================================================
CREATE TABLE IF NOT EXISTS user_cbmi_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  cbmi_score DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0.00 to 100.00
  total_bias_events INTEGER NOT NULL DEFAULT 0,
  mitigated_events INTEGER NOT NULL DEFAULT 0,
  decisions_analyzed INTEGER NOT NULL DEFAULT 0,
  top_bias_this_week TEXT, -- Most frequent bias
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE user_cbmi_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cbmi scores"
  ON user_cbmi_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own cbmi scores"
  ON user_cbmi_scores FOR ALL USING (auth.uid() = user_id);
CREATE INDEX user_cbmi_scores_user_id_idx ON user_cbmi_scores(user_id);

-- ============================================================
-- TABLE 3: user_bias_profile — The user's "Rationality Persona"
-- ============================================================
CREATE TABLE IF NOT EXISTS user_bias_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dominant_biases JSONB DEFAULT '[]', -- [{bias_name, count, trend}]
  top_strengths JSONB DEFAULT '[]', -- Biases the user has overcome
  current_cbmi DECIMAL(5,2) DEFAULT 0,
  cbmi_trend TEXT CHECK (cbmi_trend IN ('improving', 'stable', 'declining')) DEFAULT 'stable',
  persona_title TEXT DEFAULT 'Novice Decider',
  persona_level INTEGER DEFAULT 1,
  total_bias_mitigations INTEGER DEFAULT 0,
  total_decisions_with_bias_checks INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_bias_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bias profile"
  ON user_bias_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own bias profile"
  ON user_bias_profiles FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: compute_cbmi_score — Calculates CBMI for a user
-- ============================================================
CREATE OR REPLACE FUNCTION compute_cbmi_score(p_user_id UUID)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_bias_events INTEGER;
  mitigated_events INTEGER;
  cbmi DECIMAL(5,2);
BEGIN
  SELECT COUNT(*) INTO total_bias_events
  FROM bias_detection_events
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO mitigated_events
  FROM bias_detection_events
  WHERE user_id = p_user_id AND was_mitigated = TRUE;

  IF total_bias_events = 0 THEN
    cbmi := 100.00;
  ELSE
    cbmi := ROUND((mitigated_events::DECIMAL / total_bias_events) * 100, 2);
  END IF;

  RETURN cbmi;
END;
$$;

-- ============================================================
-- FUNCTION: update_user_bias_profile — Refreshes bias profile
-- ============================================================
CREATE OR REPLACE FUNCTION update_user_bias_profile(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_cbmi DECIMAL(5,2);
  prev_cbmi DECIMAL(5,2);
  trend TEXT;
  persona TEXT;
  level INTEGER;
BEGIN
  -- Get current CBMI
  current_cbmi := compute_cbmi_score(p_user_id);

  -- Get previous week's CBMI for trend
  SELECT cbmi_score INTO prev_cbmi
  FROM user_cbmi_scores
  WHERE user_id = p_user_id
  ORDER BY week_start DESC
  LIMIT 1 OFFSET 1;

  -- Determine trend
  IF prev_cbmi IS NULL THEN
    trend := 'stable';
  ELSIF current_cbmi > prev_cbmi + 5 THEN
    trend := 'improving';
  ELSIF current_cbmi < prev_cbmi - 5 THEN
    trend := 'declining';
  ELSE
    trend := 'stable';
  END IF;

  -- Determine persona title and level
  IF current_cbmi >= 90 THEN
    persona := 'Rationality Master';
    level := 5;
  ELSIF current_cbmi >= 70 THEN
    persona := 'Clear Thinker';
    level := 4;
  ELSIF current_cbmi >= 50 THEN
    persona := 'Aware Decider';
    level := 3;
  ELSIF current_cbmi >= 30 THEN
    persona := 'Bias Detective';
    level := 2;
  ELSE
    persona := 'Novice Decider';
    level := 1;
  END IF;

  -- Upsert profile
  INSERT INTO user_bias_profiles (user_id, current_cbmi, cbmi_trend, persona_title, persona_level, updated_at)
  VALUES (p_user_id, current_cbmi, trend, persona, level, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    current_cbmi = EXCLUDED.current_cbmi,
    cbmi_trend = EXCLUDED.cbmi_trend,
    persona_title = EXCLUDED.persona_title,
    persona_level = EXCLUDED.persona_level,
    updated_at = EXCLUDED.updated_at;

  -- Record weekly snapshot
  INSERT INTO user_cbmi_scores (user_id, week_start, cbmi_score)
  VALUES (p_user_id, DATE_TRUNC('week', CURRENT_DATE)::DATE, current_cbmi)
  ON CONFLICT (user_id, week_start)
  DO UPDATE SET cbmi_score = EXCLUDED.cbmi_score;
END;
$$;

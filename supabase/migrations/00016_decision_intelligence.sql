-- Migration: Unified Decision Intelligence (DQ) System
-- Merges: Prediction Calibration + Decision Velocity + DQ Scores
-- This replaces the need for separate Streak/CBMI display — all unified under DQ

-- ============================================================
-- TABLE 1: prediction_calibrations — The gambling loop
-- User predicts outcome BEFORE choosing; compare to actual on review
-- ============================================================
CREATE TABLE IF NOT EXISTS prediction_calibrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE UNIQUE,
  predicted_satisfaction INTEGER NOT NULL CHECK (predicted_satisfaction BETWEEN 1 AND 5),
  predicted_confidence INTEGER NOT NULL CHECK (predicted_confidence BETWEEN 0 AND 100),
  actual_satisfaction INTEGER CHECK (actual_satisfaction BETWEEN 1 AND 5),
  calibration_error INTEGER CHECK (calibration_error BETWEEN 0 AND 4),
  is_accurate BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prediction_calibrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own predictions"
  ON prediction_calibrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own predictions"
  ON prediction_calibrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions"
  ON prediction_calibrations FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX prediction_calibrations_user_id_idx ON prediction_calibrations(user_id);
CREATE INDEX prediction_calibrations_decision_id_idx ON prediction_calibrations(decision_id);

-- ============================================================
-- TABLE 2: decision_velocity_log — Tracks decision speed
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_velocity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  dilemma_to_decision_hours INTEGER NOT NULL,
  was_optimal BOOLEAN NOT NULL DEFAULT FALSE,
  optimal_min_hours INTEGER NOT NULL,
  optimal_max_hours INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE decision_velocity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own velocity"
  ON decision_velocity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own velocity"
  ON decision_velocity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX decision_velocity_log_user_id_idx ON decision_velocity_log(user_id);

-- ============================================================
-- TABLE 3: dq_scores — Historical DQ snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS dq_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall INTEGER NOT NULL CHECK (overall BETWEEN 0 AND 100),
  calibration_accuracy INTEGER NOT NULL DEFAULT 0,
  bias_mitigation_rate INTEGER NOT NULL DEFAULT 0,
  velocity_score INTEGER NOT NULL DEFAULT 0,
  review_consistency INTEGER NOT NULL DEFAULT 0,
  archetype TEXT NOT NULL CHECK (archetype IN ('gambler', 'overthinker', 'learner', 'decisive', 'sage')),
  trend TEXT NOT NULL CHECK (trend IN ('rising', 'stable', 'declining')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dq_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own dq scores"
  ON dq_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dq scores"
  ON dq_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX dq_scores_user_id_idx ON dq_scores(user_id);
CREATE INDEX dq_scores_created_at_idx ON dq_scores(created_at);

-- ============================================================
-- Ensure profiles has the needed columns
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_decisions_made INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_reviews_completed INTEGER DEFAULT 0;

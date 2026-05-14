-- Migration: Hindsight Reports — "Path not taken" analysis
-- Phase 4: Hindsight Feedback Loop — Core retention mechanic
-- Stores AI-generated comparisons between predictions and actual outcomes

CREATE TABLE IF NOT EXISTS hindsight_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comparison JSONB NOT NULL, -- Full HindsightComparison object
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hindsight_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hindsight reports"
  ON hindsight_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hindsight reports"
  ON hindsight_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hindsight reports"
  ON hindsight_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX hindsight_reports_decision_id_idx ON hindsight_reports(decision_id);
CREATE INDEX hindsight_reports_user_id_idx ON hindsight_reports(user_id);

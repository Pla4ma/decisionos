-- Migration: Create decision_analysis table
-- Purpose: Store AI-generated analysis results

CREATE TABLE IF NOT EXISTS decision_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option_scores JSONB DEFAULT '{}',
  summary TEXT CHECK (length(summary) <= 2000),
  factors_considered TEXT[] DEFAULT '{}',
  confidence_level INTEGER DEFAULT 0 CHECK (confidence_level >= 0 AND confidence_level <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE decision_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own analysis"
  ON decision_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis"
  ON decision_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis"
  ON decision_analysis FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis"
  ON decision_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX decision_analysis_decision_id_idx ON decision_analysis(decision_id);
CREATE INDEX decision_analysis_user_id_idx ON decision_analysis(user_id);

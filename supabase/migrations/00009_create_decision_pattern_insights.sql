-- Migration: Create decision_pattern_insights table
-- Purpose: Store personal decision pattern analysis

CREATE TABLE IF NOT EXISTS decision_pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('strength', 'bias', 'pattern', 'suggestion')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE decision_pattern_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own insights"
  ON decision_pattern_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON decision_pattern_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON decision_pattern_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON decision_pattern_insights FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX decision_pattern_insights_user_id_idx ON decision_pattern_insights(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_decision_pattern_insights_updated_at
  BEFORE UPDATE ON decision_pattern_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

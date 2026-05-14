-- Migration: Create decisions table
-- Purpose: Main decision records with status workflow

CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 200),
  context TEXT CHECK (length(context) <= 2000),
  category TEXT NOT NULL CHECK (category IN ('school', 'career', 'money', 'moving', 'business', 'personal_goals', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'questions', 'ready_for_analysis', 'analyzed', 'chosen', 'review_scheduled', 'reviewed')),
  importance INTEGER NOT NULL DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  urgency INTEGER NOT NULL DEFAULT 5 CHECK (urgency >= 1 AND urgency <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_review_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own decisions"
  ON decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions"
  ON decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
  ON decisions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions"
  ON decisions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX decisions_user_id_idx ON decisions(user_id);
CREATE INDEX decisions_status_idx ON decisions(status);
CREATE INDEX decisions_category_idx ON decisions(category);

-- Trigger for updated_at
CREATE TRIGGER update_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration: Create decision_answers table
-- Purpose: Store user answers to guided questions

CREATE TABLE IF NOT EXISTS decision_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  answer TEXT NOT NULL CHECK (length(answer) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE decision_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own answers"
  ON decision_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON decision_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
  ON decision_answers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own answers"
  ON decision_answers FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX decision_answers_decision_id_idx ON decision_answers(decision_id);
CREATE INDEX decision_answers_user_id_idx ON decision_answers(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_decision_answers_updated_at
  BEFORE UPDATE ON decision_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

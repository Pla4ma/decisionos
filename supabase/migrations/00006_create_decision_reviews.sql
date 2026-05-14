-- Migration: Create decision_reviews table
-- Purpose: Store post-decision outcome tracking

CREATE TABLE IF NOT EXISTS decision_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chosen_option_id UUID NOT NULL REFERENCES decision_options(id) ON DELETE CASCADE,
  outcome_notes TEXT NOT NULL CHECK (length(outcome_notes) >= 10 AND length(outcome_notes) <= 2000),
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),
  would_choose_same BOOLEAN,
  lessons_learned TEXT CHECK (length(lessons_learned) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE decision_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own reviews"
  ON decision_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON decision_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON decision_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON decision_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX decision_reviews_decision_id_idx ON decision_reviews(decision_id);
CREATE INDEX decision_reviews_user_id_idx ON decision_reviews(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_decision_reviews_updated_at
  BEFORE UPDATE ON decision_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

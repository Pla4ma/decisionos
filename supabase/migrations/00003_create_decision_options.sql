-- Migration: Create decision_options table
-- Purpose: Store decision alternatives with pros/cons

CREATE TABLE IF NOT EXISTS decision_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 2 AND length(title) <= 100),
  description TEXT CHECK (length(description) <= 500),
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  is_chosen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE decision_options ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own options"
  ON decision_options FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own options"
  ON decision_options FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own options"
  ON decision_options FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own options"
  ON decision_options FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX decision_options_decision_id_idx ON decision_options(decision_id);
CREATE INDEX decision_options_user_id_idx ON decision_options(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_decision_options_updated_at
  BEFORE UPDATE ON decision_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration: Create ai_usage_events table
-- Purpose: Track AI analysis usage for billing

CREATE TABLE IF NOT EXISTS ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('analysis', 'follow_up')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ai_usage_events ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own usage events"
  ON ai_usage_events FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role (edge functions) can insert usage events
CREATE POLICY "Only service role can insert usage events"
  ON ai_usage_events FOR INSERT
  WITH CHECK (false);

-- Create indexes
CREATE INDEX ai_usage_events_user_id_idx ON ai_usage_events(user_id);
CREATE INDEX ai_usage_events_created_at_idx ON ai_usage_events(created_at);

-- Migration: Template use counter and reminder tracking
CREATE OR REPLACE FUNCTION increment_template_use(p_template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE decision_templates SET times_used = times_used + 1 WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification_tokens if not exists
CREATE TABLE IF NOT EXISTS notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'expo',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

ALTER TABLE notification_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tokens"
  ON notification_tokens FOR ALL USING (auth.uid() = user_id);

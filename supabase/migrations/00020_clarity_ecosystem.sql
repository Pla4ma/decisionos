-- Migration: Daily Clarity Practice, Decision Inbox, Future Self, Pattern Recognition, Journal, Second Opinion

-- Daily Clarity Practice — the core daily habit
CREATE TABLE IF NOT EXISTS daily_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  practice_type TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  context TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  user_response TEXT,
  reflection TEXT,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, date)
);

ALTER TABLE daily_practices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own practices" ON daily_practices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practices" ON daily_practices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own practices" ON daily_practices FOR UPDATE USING (auth.uid() = user_id);

-- Decision Inbox — ultra-lightweight capture
CREATE TABLE IF NOT EXISTS decision_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  thought TEXT NOT NULL,
  context TEXT,
  category TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  is_processed BOOLEAN NOT NULL DEFAULT false,
  processed_to_decision_id UUID,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE decision_inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own inbox" ON decision_inbox FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to own inbox" ON decision_inbox FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inbox" ON decision_inbox FOR UPDATE USING (auth.uid() = user_id);

-- Future Self Messages — persistent AI persona
CREATE TABLE IF NOT EXISTS future_self_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

ALTER TABLE future_self_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON future_self_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON future_self_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON future_self_messages FOR UPDATE USING (auth.uid() = user_id);

-- Pattern Insights — proactive data-driven insights
CREATE TABLE IF NOT EXISTS pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_summary TEXT,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'moderate',
  is_actionable BOOLEAN NOT NULL DEFAULT false,
  suggested_action TEXT,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pattern_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON pattern_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON pattern_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON pattern_insights FOR UPDATE USING (auth.uid() = user_id);

-- Decision Journal — free-form writing
CREATE TABLE IF NOT EXISTS decision_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  sentiment TEXT,
  category_hint TEXT,
  decision_id UUID,
  is_analyzed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE decision_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own journal" ON decision_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to own journal" ON decision_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON decision_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON decision_journal FOR DELETE USING (auth.uid() = user_id);

-- Second Opinion Network — anonymous community voting
CREATE TABLE IF NOT EXISTS second_opinion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open',
  total_votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE second_opinion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own requests" ON second_opinion_requests FOR SELECT USING (auth.uid() = user_id OR status = 'open');
CREATE POLICY "Users can insert requests" ON second_opinion_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON second_opinion_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS second_opinion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES second_opinion_requests(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES auth.users(id) NOT NULL,
  selected_option_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, voter_id)
);

ALTER TABLE second_opinion_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own votes" ON second_opinion_votes FOR SELECT USING (auth.uid() = voter_id);
CREATE POLICY "Users can insert votes" ON second_opinion_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Public opinion requests view
CREATE OR REPLACE VIEW public_opinion_requests AS
SELECT
  sor.id,
  sor.question,
  sor.options,
  sor.total_votes,
  sor.status,
  d.category
FROM second_opinion_requests sor
LEFT JOIN decisions d ON d.id = sor.decision_id
WHERE sor.status = 'open' AND sor.user_id != auth.uid();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_practices_user_date ON daily_practices(user_id, date);
CREATE INDEX IF NOT EXISTS idx_decision_inbox_user ON decision_inbox(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_future_self_user ON future_self_messages(user_id, is_archived, is_read);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_user ON pattern_insights(user_id, is_dismissed);
CREATE INDEX IF NOT EXISTS idx_decision_journal_user ON decision_journal(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_second_opinion_status ON second_opinion_requests(status, created_at DESC);

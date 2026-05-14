-- Micro-reviews (quick emoji check-ins) and quick reviews
CREATE TABLE IF NOT EXISTS micro_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  feeling TEXT NOT NULL CHECK (feeling IN ('great', 'good', 'okay', 'worried', 'regret')),
  note TEXT,
  days_since_commit INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE micro_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own micro reviews"
  ON micro_reviews FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own micro reviews"
  ON micro_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quick reviews (single-tap emoji satisfaction)
CREATE TABLE IF NOT EXISTS quick_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  feeling INTEGER NOT NULL CHECK (feeling >= 1 AND feeling <= 5),
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quick_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quick reviews"
  ON quick_reviews FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quick reviews"
  ON quick_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Life chapters
CREATE TABLE IF NOT EXISTS life_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT NOT NULL DEFAULT '🌟',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  decision_count INTEGER NOT NULL DEFAULT 0,
  reviewed_count INTEGER NOT NULL DEFAULT 0,
  average_satisfaction DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE life_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chapters"
  ON life_chapters FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chapters"
  ON life_chapters FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapters"
  ON life_chapters FOR UPDATE USING (auth.uid() = user_id);

-- Add chapter_id to decisions
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES life_chapters(id);

-- Decision graveyard
CREATE TABLE IF NOT EXISTS decision_graveyard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  original_title TEXT NOT NULL,
  original_category TEXT,
  abandoned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT NOT NULL DEFAULT 'other',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE decision_graveyard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own graveyard"
  ON decision_graveyard FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into graveyard"
  ON decision_graveyard FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from graveyard"
  ON decision_graveyard FOR DELETE USING (auth.uid() = user_id);

-- Practice sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id TEXT NOT NULL,
  chosen_option_index INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own practice sessions"
  ON practice_sessions FOR SELECT USING (true);

CREATE POLICY "Users can insert practice sessions"
  ON practice_sessions FOR INSERT WITH CHECK (true);

-- Accountability pacts
CREATE TABLE IF NOT EXISTS accountability_pacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  partner_id UUID REFERENCES auth.users(id),
  partner_email TEXT NOT NULL,
  pact_type TEXT NOT NULL DEFAULT 'share_vote',
  visibility TEXT NOT NULL DEFAULT 'partners_only',
  status TEXT NOT NULL DEFAULT 'pending',
  owner_committed_option_id UUID,
  partner_voted_option_id UUID,
  review_expected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE accountability_pacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pacts"
  ON accountability_pacts FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert pacts"
  ON accountability_pacts FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pacts"
  ON accountability_pacts FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = partner_id);

-- Pact invites
CREATE TABLE IF NOT EXISTS pact_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pact_id UUID REFERENCES accountability_pacts(id) ON DELETE CASCADE NOT NULL,
  inviter_name TEXT NOT NULL,
  decision_title TEXT NOT NULL,
  invite_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pact_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pact invites by token"
  ON pact_invites FOR SELECT USING (true);

CREATE POLICY "Users can insert pact invites"
  ON pact_invites FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update pact invites"
  ON pact_invites FOR UPDATE USING (true);

-- Add is_practice to decisions
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS is_practice BOOLEAN NOT NULL DEFAULT false;

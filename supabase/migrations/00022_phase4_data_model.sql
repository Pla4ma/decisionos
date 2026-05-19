-- Phase 4: Data model cleanup, RLS lockdown, and account deletion
-- 4.1: Classify all tables with PostgreSQL comments
-- 4.2: Lock down RLS policies on experimental/social tables
-- 4.3: delete_user_data RPC for complete account deletion

-- ============================================================
-- 4.1 TABLE CLASSIFICATION
-- ============================================================

-- CORE: Essential for basic app function
COMMENT ON TABLE profiles IS 'core: user identity, onboarding, subscription tier';
COMMENT ON TABLE decisions IS 'core: primary decision records';
COMMENT ON TABLE decision_options IS 'core: options within decisions';
COMMENT ON TABLE decision_answers IS 'core: user answers to guided questions';
COMMENT ON TABLE decision_analysis IS 'core: AI analysis results for decisions';
COMMENT ON TABLE decision_reviews IS 'core: user outcome reviews after choosing';
COMMENT ON TABLE ai_usage_events IS 'core: AI usage tracking for quota enforcement';
COMMENT ON TABLE subscriptions IS 'core: billing and subscription tier storage';

-- PROGRESSIVE: Unlocked via feature progression system
COMMENT ON TABLE decision_forecasts IS 'progressive: regret forecasts and future self letters';
COMMENT ON TABLE pattern_insights IS 'progressive: AI-detected decision patterns';
COMMENT ON TABLE dq_scores IS 'progressive: decision quality scores per user';
COMMENT ON TABLE user_blind_spots IS 'progressive: recurring thinking trap detection';
COMMENT ON TABLE user_cbmi_scores IS 'progressive: cognitive bias mitigation index';
COMMENT ON TABLE user_bias_profiles IS 'progressive: aggregate bias profile per user';
COMMENT ON TABLE prediction_calibrations IS 'progressive: prediction accuracy calibration';
COMMENT ON TABLE decision_velocity_log IS 'progressive: granular velocity tracking';
COMMENT ON TABLE future_self_messages IS 'progressive: messages from future self';
COMMENT ON TABLE daily_practices IS 'progressive: daily clarity practice prompts';
COMMENT ON TABLE decision_journal IS 'progressive: freeform journal entries';
COMMENT ON TABLE decision_inbox IS 'progressive: capture inbox for decision ideas';
COMMENT ON TABLE life_chapters IS 'progressive: life chapter organization';
COMMENT ON TABLE decision_graveyard IS 'progressive: discarded decisions archive';
COMMENT ON TABLE decision_velocity IS 'progressive: decision speed tracking';
COMMENT ON TABLE prediction_accuracy IS 'progressive: forecast accuracy tracking';
COMMENT ON TABLE hindsight_reports IS 'progressive: hindsight comparison reports';
COMMENT ON TABLE bias_detection_events IS 'progressive: per-decision bias events';
COMMENT ON TABLE notification_tokens IS 'progressive: push notification device tokens';
COMMENT ON TABLE earned_analyses IS 'progressive: free analysis credits from reviews';
COMMENT ON TABLE decision_reflections IS 'progressive: periodic reflection entries';
COMMENT ON TABLE micro_reviews IS 'progressive: lightweight outcome check-ins';
COMMENT ON TABLE quick_reviews IS 'progressive: 48-hour quick review responses';
COMMENT ON TABLE user_streaks IS 'progressive: weekly engagement streaks';
COMMENT ON TABLE daily_streaks IS 'progressive: daily engagement streaks';
COMMENT ON TABLE decision_playbooks IS 'progressive: personalized decision playbook';

-- EXPERIMENTAL: Used but could be deferred without breaking core flow
COMMENT ON TABLE decision_challenges IS 'experimental: interactive decision challenges';
COMMENT ON TABLE user_challenge_responses IS 'experimental: user responses to challenges';
COMMENT ON TABLE decision_templates IS 'experimental: reusable decision templates';

-- DISABLED: Social features — not visible in UI, locked down
COMMENT ON TABLE decision_partners IS 'disabled: partner sharing for decisions';
COMMENT ON TABLE practice_sessions IS 'disabled: practice decision sessions';
COMMENT ON TABLE accountability_pacts IS 'disabled: mutual accountability agreements';
COMMENT ON TABLE pact_invites IS 'disabled: invites to accountability pacts';
COMMENT ON TABLE second_opinion_requests IS 'disabled: public second opinion requests';
COMMENT ON TABLE second_opinion_votes IS 'disabled: votes on second opinion requests';

-- DEPRECATED: Replaced by newer tables
COMMENT ON TABLE decision_pattern_insights IS 'deprecated: replaced by pattern_insights';

-- ============================================================
-- 4.2 RLS LOCKDOWN
-- ============================================================

-- decision_challenges: was open SELECT to all; restrict to own
DROP POLICY IF EXISTS "Anyone can view challenges" ON decision_challenges;
CREATE POLICY "Users can view challenges"
  ON decision_challenges FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM user_challenge_responses WHERE challenge_id = id
  ));

-- decision_templates: was open SELECT to all; restrict to service role only
DROP POLICY IF EXISTS "Anyone can view templates" ON decision_templates;
CREATE POLICY "Only service role can manage templates"
  ON decision_templates FOR SELECT
  USING (false);

-- practice_sessions: was open SELECT/INSERT; lock to own user_id
-- Note: practice_sessions does NOT have a user_id column
-- We need to add one first
ALTER TABLE practice_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users can view their own practice sessions" ON practice_sessions;
CREATE POLICY "Users can view own practice sessions"
  ON practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert practice sessions" ON practice_sessions;
CREATE POLICY "Users can insert own practice sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- pact_invites: was fully open; block all access (disabled social feature)
DROP POLICY IF EXISTS "Anyone can view pact invites by token" ON pact_invites;
DROP POLICY IF EXISTS "Users can insert pact invites" ON pact_invites;
DROP POLICY IF EXISTS "Users can update pact invites" ON pact_invites;
ALTER TABLE pact_invites FORCE ROW LEVEL SECURITY;
CREATE POLICY "No access to pact invites"
  ON pact_invites FOR ALL
  USING (false);

-- second_opinion_requests: was open to all when status = 'open'; block all (disabled social feature)
DROP POLICY IF EXISTS "Users can view own requests" ON second_opinion_requests;
DROP POLICY IF EXISTS "Users can insert requests" ON second_opinion_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON second_opinion_requests;
CREATE POLICY "No access to second opinion requests"
  ON second_opinion_requests FOR ALL
  USING (false);

-- second_opinion_votes: block all (disabled social feature)
DROP POLICY IF EXISTS "Users can view own votes" ON second_opinion_votes;
DROP POLICY IF EXISTS "Users can insert votes" ON second_opinion_votes;
CREATE POLICY "No access to second opinion votes"
  ON second_opinion_votes FOR ALL
  USING (false);

-- decision_partners: block all (disabled social feature)
DROP POLICY IF EXISTS "Users can view own shares" ON decision_partners;
DROP POLICY IF EXISTS "Users can view received shares" ON decision_partners;
DROP POLICY IF EXISTS "Users can create own shares" ON decision_partners;
DROP POLICY IF EXISTS "Partners can update responses" ON decision_partners;
CREATE POLICY "No access to decision partners"
  ON decision_partners FOR ALL
  USING (false);

-- accountability_pacts: block all (disabled social feature)
DROP POLICY IF EXISTS "Users can view their own pacts" ON accountability_pacts;
DROP POLICY IF EXISTS "Users can insert pacts" ON accountability_pacts;
DROP POLICY IF EXISTS "Users can update their own pacts" ON accountability_pacts;
CREATE POLICY "No access to accountability pacts"
  ON accountability_pacts FOR ALL
  USING (false);

-- ============================================================
-- 4.3 DELETE USER DATA RPC
-- ============================================================

-- Complete account deletion function
-- Covers every user-owned table to ensure full GDPR-style deletion
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is the user themselves or a service role
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Cannot delete another user''s data';
  END IF;

  -- CORE tables
  DELETE FROM public.decision_reviews WHERE user_id = p_user_id;
  DELETE FROM public.decision_analysis WHERE user_id = p_user_id;
  DELETE FROM public.decision_answers WHERE user_id = p_user_id;
  DELETE FROM public.decision_options WHERE user_id = p_user_id;
  DELETE FROM public.decisions WHERE user_id = p_user_id;
  DELETE FROM public.ai_usage_events WHERE user_id = p_user_id;
  DELETE FROM public.subscriptions WHERE user_id = p_user_id;

  -- PROGRESSIVE tables
  DELETE FROM public.decision_forecasts WHERE user_id = p_user_id;
  DELETE FROM public.pattern_insights WHERE user_id = p_user_id;
  DELETE FROM public.dq_scores WHERE user_id = p_user_id;
  DELETE FROM public.user_blind_spots WHERE user_id = p_user_id;
  DELETE FROM public.user_cbmi_scores WHERE user_id = p_user_id;
  DELETE FROM public.user_bias_profiles WHERE user_id = p_user_id;
  DELETE FROM public.prediction_calibrations WHERE user_id = p_user_id;
  DELETE FROM public.decision_velocity_log WHERE user_id = p_user_id;
  DELETE FROM public.future_self_messages WHERE user_id = p_user_id;
  DELETE FROM public.daily_practices WHERE user_id = p_user_id;
  DELETE FROM public.decision_journal WHERE user_id = p_user_id;
  DELETE FROM public.decision_inbox WHERE user_id = p_user_id;
  DELETE FROM public.life_chapters WHERE user_id = p_user_id;
  DELETE FROM public.decision_graveyard WHERE user_id = p_user_id;
  DELETE FROM public.decision_velocity WHERE user_id = p_user_id;
  DELETE FROM public.prediction_accuracy WHERE user_id = p_user_id;
  DELETE FROM public.hindsight_reports WHERE user_id = p_user_id;
  DELETE FROM public.bias_detection_events WHERE user_id = p_user_id;
  DELETE FROM public.notification_tokens WHERE user_id = p_user_id;
  DELETE FROM public.earned_analyses WHERE user_id = p_user_id;
  DELETE FROM public.decision_reflections WHERE user_id = p_user_id;
  DELETE FROM public.micro_reviews WHERE user_id = p_user_id;
  DELETE FROM public.quick_reviews WHERE user_id = p_user_id;
  DELETE FROM public.user_streaks WHERE user_id = p_user_id;
  DELETE FROM public.daily_streaks WHERE user_id = p_user_id;
  DELETE FROM public.decision_playbooks WHERE user_id = p_user_id;
  DELETE FROM public.user_challenge_responses WHERE user_id = p_user_id;
  DELETE FROM public.decision_pattern_insights WHERE user_id = p_user_id;

  -- DISABLED tables
  DELETE FROM public.decision_partners WHERE owner_id = p_user_id OR partner_id = p_user_id;
  DELETE FROM public.practice_sessions WHERE user_id = p_user_id;
  DELETE FROM public.accountability_pacts WHERE owner_id = p_user_id OR partner_id = p_user_id;
  -- pact_invites deleted via CASCADE from accountability_pacts
  DELETE FROM public.second_opinion_requests WHERE user_id = p_user_id;
  DELETE FROM public.second_opinion_votes WHERE voter_id = p_user_id;

  -- Delete the profile (this cascades to auth.users if ON DELETE CASCADE is set)
  DELETE FROM public.profiles WHERE id = p_user_id;

  -- Delete the auth user entry to complete account removal
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

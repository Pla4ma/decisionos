-- Migration: Retention & Engagement Systems (10/10 upgrade)
-- Phase 2-11: Streaks, Reflections, Social, Challenges, Benchmarks, Templates, Earned Analyses

-- ============================================================
-- TABLE 1: user_streaks — Weekly decision consistency tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_weeks_active INTEGER NOT NULL DEFAULT 0,
  last_activity_week TEXT, -- ISO week format YYYY-WW
  grace_days_used INTEGER NOT NULL DEFAULT 0,
  max_grace_days INTEGER NOT NULL DEFAULT 1,
  streak_started_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own streak"
  ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own streak"
  ON user_streaks FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABLE 2: decision_reflections — Weekly mini-check-ins between creation and review
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL, -- 1, 2, 3, etc. since decision was made
  feeling TEXT CHECK (feeling IN ('confident', 'uncertain', 'regretful', 'relieved', 'anxious', 'neutral')),
  thought TEXT, -- quick note (optional)
  would_choose_same_so_far BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(decision_id, week_number)
);

ALTER TABLE decision_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reflections"
  ON decision_reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections"
  ON decision_reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reflections"
  ON decision_reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX decision_reflections_decision_id_idx ON decision_reflections(decision_id);

-- ============================================================
-- TABLE 3: decision_challenges — Daily/weekly micro-engagement puzzles
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('quick_poll', 'blind_spot_quiz', 'what_would_you_do', 'tradeoff_puzzle', 'values_check')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scenario TEXT NOT NULL,
  options JSONB NOT NULL, -- [{id, title, explanation}]
  correct_insight TEXT, -- For quizzes: the key learning
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  active_from DATE NOT NULL DEFAULT CURRENT_DATE,
  active_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE decision_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenges"
  ON decision_challenges FOR SELECT USING (true);

-- ============================================================
-- TABLE 4: user_challenge_responses — User answers to challenges
-- ============================================================
CREATE TABLE IF NOT EXISTS user_challenge_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES decision_challenges(id) ON DELETE CASCADE,
  selected_option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenge_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own responses"
  ON user_challenge_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses"
  ON user_challenge_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLE 5: decision_partners — Lightweight sharing with friends
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  share_token TEXT NOT NULL UNIQUE,
  partner_label TEXT, -- "Friend", "Partner", "Mentor"
  partner_input TEXT, -- The friend's 1-sentence advice
  partner_voted_option_id TEXT,
  status TEXT CHECK (status IN ('pending', 'viewed', 'responded', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

ALTER TABLE decision_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own shares"
  ON decision_partners FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can view received shares"
  ON decision_partners FOR SELECT USING (auth.uid() = partner_id);
CREATE POLICY "Users can create own shares"
  ON decision_partners FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Partners can update responses"
  ON decision_partners FOR UPDATE USING (auth.uid() = partner_id);
CREATE INDEX decision_partners_share_token_idx ON decision_partners(share_token);

-- ============================================================
-- TABLE 6: decision_templates — Pre-built frameworks for common decisions
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  example_title TEXT,
  example_context TEXT,
  guided_questions JSONB NOT NULL DEFAULT '[]', -- [{question_key, question_text, is_required}]
  suggested_options JSONB DEFAULT '[]', -- [{title, description, pros[], cons[]}]
  score_weights JSONB DEFAULT '{"regret_risk":0.25,"confidence":0.25,"values_alignment":0.2,"reversibility":0.15,"risk":0.15}',
  recommended_review_days INTEGER DEFAULT 30,
  tier TEXT CHECK (tier IN ('free', 'plus')) DEFAULT 'free',
  times_used INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE decision_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view templates"
  ON decision_templates FOR SELECT USING (true);

-- ============================================================
-- TABLE 7: earned_analyses — Free tier can earn analyses through reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS earned_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('review_completed')),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  is_used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days'),
  UNIQUE(user_id, decision_id, source)
);

ALTER TABLE earned_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own earned analyses"
  ON earned_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own earned analyses"
  ON earned_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own earned analyses"
  ON earned_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX earned_analyses_user_id_idx ON earned_analyses(user_id);

-- ============================================================
-- RPC: Update user streak based on activity
-- ============================================================
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID, p_activity_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  v_current_week TEXT;
  v_last_week TEXT;
  v_prev_week TEXT;
  v_streak RECORD;
  v_new_streak INTEGER;
  v_grace_used INTEGER;
BEGIN
  v_current_week := to_char(p_activity_date, 'IYYY-IW');

  SELECT * INTO v_streak FROM user_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_weeks_active, last_activity_week, streak_started_at)
    VALUES (p_user_id, 1, 1, 1, v_current_week, NOW())
    RETURNING * INTO v_streak;

    RETURN jsonb_build_object(
      'current_streak', 1,
      'longest_streak', 1,
      'is_new', true,
      'streak_updated', true
    );
  END IF;

  IF v_streak.last_activity_week = v_current_week THEN
    RETURN jsonb_build_object(
      'current_streak', v_streak.current_streak,
      'longest_streak', v_streak.longest_streak,
      'already_updated', true
    );
  END IF;

  v_last_week := to_char(p_activity_date - INTERVAL '7 days', 'IYYY-IW');
  v_prev_week := to_char(p_activity_date - INTERVAL '14 days', 'IYYY-IW');

  IF v_streak.last_activity_week = v_last_week THEN
    v_new_streak := v_streak.current_streak + 1;
    v_grace_used := 0;
  ELSIF v_streak.last_activity_week = v_prev_week AND v_streak.grace_days_used < v_streak.max_grace_days THEN
    v_new_streak := v_streak.current_streak + 1;
    v_grace_used := v_streak.grace_days_used + 1;
  ELSE
    v_new_streak := 1;
    v_grace_used := 0;
  END IF;

  UPDATE user_streaks SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(COALESCE(v_streak.longest_streak, 0), v_new_streak),
    total_weeks_active = COALESCE(v_streak.total_weeks_active, 0) + 1,
    last_activity_week = v_current_week,
    grace_days_used = v_grace_used,
    streak_started_at = CASE WHEN v_new_streak = 1 THEN NOW() ELSE v_streak.streak_started_at END,
    last_updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', GREATEST(COALESCE(v_streak.longest_streak, 0), v_new_streak),
    'grace_days_used', v_grace_used,
    'streak_updated', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Get anonymous benchmarks for social comparison
-- ============================================================
CREATE OR REPLACE FUNCTION get_anonymous_benchmarks(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_regret_rate NUMERIC;
  v_user_satisfaction NUMERIC;
  v_user_avg_hours NUMERIC;
  v_user_consistency_days INTEGER;
  v_user_review_count INTEGER;
  v_benchmark JSONB;
BEGIN
  SELECT regret_rate, avg_decision_hours, decision_consistency_days, total_reviews_completed, avg_satisfaction
  INTO v_user_regret_rate, v_user_avg_hours, v_user_consistency_days, v_user_review_count, v_user_satisfaction
  FROM (
    SELECT
      p.regret_rate,
      p.avg_decision_hours,
      p.decision_consistency_days,
      p.total_reviews_completed,
      (SELECT AVG(satisfaction_score)::NUMERIC(10,2)
       FROM decision_reviews WHERE user_id = p_user_id AND satisfaction_score IS NOT NULL) as avg_satisfaction
    FROM profiles p WHERE p.id = p_user_id
  ) sub;

  IF v_user_review_count < 1 THEN
    RETURN jsonb_build_object('eligible', false, 'reviews_needed', 1);
  END IF;

  SELECT jsonb_build_object(
    'eligible', true,
    'regret_rate', jsonb_build_object(
      'yours', ROUND(v_user_regret_rate, 1),
      'median', (SELECT ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY regret_rate)::NUMERIC, 1)
                 FROM profiles WHERE regret_rate IS NOT NULL AND total_reviews_completed >= 1),
      'percentile', (SELECT ROUND((COUNT(*) FILTER (WHERE regret_rate > v_user_regret_rate) * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC, 0)
                     FROM profiles WHERE regret_rate IS NOT NULL AND total_reviews_completed >= 1)
    ),
    'satisfaction', jsonb_build_object(
      'yours', ROUND(v_user_satisfaction, 1),
      'median', (SELECT ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 
        (SELECT AVG(s.satisfaction_score) FROM decision_reviews s WHERE s.user_id = p.id AND s.satisfaction_score IS NOT NULL)
      )::NUMERIC, 1) FROM profiles p WHERE p.total_reviews_completed >= 1)
    ),
    'consistency', jsonb_build_object(
      'yours', v_user_consistency_days,
      'avg', (SELECT ROUND(AVG(decision_consistency_days)) FROM profiles WHERE total_reviews_completed >= 1 AND decision_consistency_days > 0)
    ),
    'total_reviewed', v_user_review_count,
    'peer_count', (SELECT COUNT(*) FROM profiles WHERE total_reviews_completed >= 1)
  ) INTO v_benchmark;

  RETURN v_benchmark;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Get weekly decision reflections summary
-- ============================================================
CREATE OR REPLACE FUNCTION get_weekly_reflection_summary(p_user_id UUID)
RETURNS TABLE(
  decision_id UUID,
  decision_title TEXT,
  weeks_since_choice INTEGER,
  latest_feeling TEXT,
  total_reflections INTEGER,
  reflection_trend TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    EXTRACT(WEEK FROM (NOW() - d.updated_at))::INTEGER,
    (SELECT r.feeling FROM decision_reflections r
     WHERE r.decision_id = d.id ORDER BY r.week_number DESC LIMIT 1),
    (SELECT COUNT(*) FROM decision_reflections r WHERE r.decision_id = d.id),
    CASE
      WHEN (SELECT r.would_choose_same_so_far FROM decision_reflections r
            WHERE r.decision_id = d.id ORDER BY r.week_number DESC LIMIT 1) = true THEN 'confident'
      WHEN (SELECT r.would_choose_same_so_far FROM decision_reflections r
            WHERE r.decision_id = d.id ORDER BY r.week_number DESC LIMIT 1) = false THEN 'wavering'
      ELSE 'unknown'
    END
  FROM decisions d
  WHERE d.user_id = p_user_id
    AND d.status IN ('chosen', 'review_scheduled')
    AND d.updated_at < NOW() - INTERVAL '3 days'
    AND d.updated_at > NOW() - INTERVAL '180 days'
  ORDER BY d.updated_at DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Get personal improvement score
-- ============================================================
CREATE OR REPLACE FUNCTION get_improvement_score(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_reviews INTEGER;
  v_first_5_satisfaction NUMERIC;
  v_last_5_satisfaction NUMERIC;
  v_trend TEXT;
  v_overall_score INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_reviews FROM decision_reviews WHERE user_id = p_user_id;

  IF v_total_reviews < 3 THEN
    RETURN jsonb_build_object('ready', false, 'reviews_needed', 3 - v_total_reviews);
  END IF;

  SELECT AVG(satisfaction_score)::NUMERIC(10,2) INTO v_first_5_satisfaction
  FROM (
    SELECT satisfaction_score FROM decision_reviews
    WHERE user_id = p_user_id AND satisfaction_score IS NOT NULL
    ORDER BY created_at ASC LIMIT 3
  ) first_three;

  SELECT AVG(satisfaction_score)::NUMERIC(10,2) INTO v_last_5_satisfaction
  FROM (
    SELECT satisfaction_score FROM decision_reviews
    WHERE user_id = p_user_id AND satisfaction_score IS NOT NULL
    ORDER BY created_at DESC LIMIT 3
  ) last_three;

  IF v_last_5_satisfaction > v_first_5_satisfaction + 0.5 THEN
    v_trend := 'improving';
  ELSIF v_last_5_satisfaction < v_first_5_satisfaction - 0.5 THEN
    v_trend := 'declining';
  ELSE
    v_trend := 'stable';
  END IF;

  v_overall_score := ROUND((v_last_5_satisfaction / 5.0) * 100);

  RETURN jsonb_build_object(
    'ready', true,
    'overall_score', v_overall_score,
    'trend', v_trend,
    'recent_avg', v_last_5_satisfaction,
    'early_avg', v_first_5_satisfaction,
    'total_reviews', v_total_reviews
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Get earned analyses count
-- ============================================================
CREATE OR REPLACE FUNCTION get_earned_analyses(p_user_id UUID)
RETURNS TABLE(
  total_earned BIGINT,
  unused_count BIGINT,
  can_earn_today BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE NOT is_used AND expires_at > NOW())::BIGINT,
    NOT EXISTS (
      SELECT 1 FROM earned_analyses
      WHERE user_id = p_user_id AND source = 'review_completed'
        AND earned_at::date = CURRENT_DATE
    )
  FROM earned_analyses
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- Seed: Initial decision challenges
-- ============================================================
INSERT INTO decision_challenges (challenge_type, title, description, scenario, options, difficulty, category) VALUES
('blind_spot_quiz', 'Spot the Bias', 'Can you identify which cognitive bias is at play here?',
 'You are considering a career change. You have spent 5 years in your current role and invested heavily in certifications. The new role pays less initially but has higher growth potential. You find yourself thinking: "I have already put so much into this career path, I should stick with it."',
 '[{"id":"a","title":"Sunk Cost Fallacy","explanation":"Correct. The time and money you have already invested cannot be recovered. The decision should be based on future value, not past investment."},{"id":"b","title":"Confirmation Bias","explanation":"Not quite. Confirmation bias is seeking evidence that supports existing beliefs. This is about feeling trapped by past investments."},{"id":"c","title":"Anchoring","explanation":"Close, but anchoring is relying too heavily on the first piece of information. This is about past investment clouding future judgment."}]',
 'The Sunk Cost Fallacy makes us consider irrecoverable past investments when making decisions about the future.',
 'easy', 'career'),

('what_would_you_do', 'The Job Offer Crossroads', 'You have two offers. What would guide your choice?',
 'Offer A: $120K at a stable company, 9-5, known brand, limited growth.\nOffer B: $90K at a startup, high risk, high growth potential, equity.\nYou are 28, single, no debt, $30K savings.',
 '[{"id":"a","title":"Go with Offer A for stability","explanation":"A valid choice if security is your top value. But at 28 with no dependents, you have time to take risks."},{"id":"b","title":"Go with Offer B for upside","explanation":"At 28 with savings and no dependents, you are in a strong position to bet on growth. The upside could be life-changing."},{"id":"c","title":"Negotiate Offer A up using Offer B as leverage","explanation":"Often the smartest move. Use the startup offer to get more from the stable company. Best of both worlds."}]',
 'When you have multiple offers and low risk, negotiation creates asymmetric upside.',
 'medium', 'career'),

('tradeoff_puzzle', 'The Moving Decision', 'Choose the option you would most strongly recommend.',
 'You have a job offer in another city. Current city: friends, family, comfort. New city: 40% higher salary, better career path, no social network.',
 '[{"id":"a","title":"Stay — relationships matter more than money","explanation":"Social ties are a major predictor of happiness. But career stagnation has costs too."},{"id":"b","title":"Go — career growth compounds, friends can visit","explanation":"Early career moves compound into significantly higher lifetime earnings. You can build new social networks."},{"id":"c","title":"Negotiate remote/hybrid — test before committing","explanation":"Smart middle path. Reduces risk while exploring the opportunity. Many companies now accommodate this."}]',
 'Good decisions often involve finding a middle path rather than binary choices.',
 'medium', 'moving'),

('values_check', 'Values vs. Opportunity', 'When values and opportunity conflict, what wins?',
 'A promotion requires you to manage a team of 12, but you value autonomy and quiet deep work. The role pays 30% more.',
 '[{"id":"a","title":"Take the promotion — growth requires discomfort","explanation":"Growth often means leaving your comfort zone. But at what cost to happiness?"},{"id":"b","title":"Decline — values alignment predicts long-term satisfaction","explanation":"The app''s own research shows values_alignment is one of the strongest predictors of decision satisfaction."},{"id":"c","title":"Ask to reshape the role — keep deep work, share management duties","explanation":"Creative solution. Companies often accommodate high performers who propose structural alternatives."}]',
 'Values alignment has a 0.20 weight in DecisionOS scoring for a reason — it is one of the strongest predictors of satisfaction.',
 'hard', 'career'),

('quick_poll', 'Quick Gut Check', 'Which factor matters most in YOUR big decisions?',
 'When you look back at your best decisions, what was the deciding factor?',
 '[{"id":"a","title":"Logic and analysis","explanation":""},{"id":"b","title":"Gut feeling / intuition","explanation":""},{"id":"c","title":"Advice from someone I trust","explanation":""},{"id":"d","title":"Values and principles","explanation":""}]',
 'Understanding your personal decision style is the first step to improving it.',
 'easy', 'other');

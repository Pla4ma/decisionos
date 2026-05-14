-- Daily streaks for engagement tracking
CREATE TABLE IF NOT EXISTS daily_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in_date DATE NOT NULL,
  grace_days_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily streak"
  ON daily_streaks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily streak"
  ON daily_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily streak"
  ON daily_streaks FOR UPDATE USING (auth.uid() = user_id);

-- daily_check_in RPC
CREATE OR REPLACE FUNCTION daily_check_in(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_streak RECORD;
  v_result JSONB;
BEGIN
  v_today := CURRENT_DATE;
  v_yesterday := v_today - 1;

  SELECT * INTO v_streak FROM daily_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO daily_streaks (user_id, current_streak, longest_streak, last_check_in_date)
    VALUES (p_user_id, 1, 1, v_today)
    RETURNING * INTO v_streak;
  ELSE
    IF v_streak.last_check_in_date = v_today THEN
      -- Already checked in today
      v_result := jsonb_build_object(
        'current_streak', v_streak.current_streak,
        'longest_streak', v_streak.longest_streak,
        'checked_in_today', true
      );
      RETURN v_result;
    END IF;

    IF v_streak.last_check_in_date = v_yesterday THEN
      -- Consecutive day
      UPDATE daily_streaks
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_check_in_date = v_today,
          grace_days_used = GREATEST(0, grace_days_used - 1),
          updated_at = now()
      WHERE user_id = p_user_id
      RETURNING * INTO v_streak;
    ELSE
      -- Streak broken (or grace period)
      IF v_streak.grace_days_used < 1 THEN
        -- Use grace day
        UPDATE daily_streaks
        SET grace_days_used = grace_days_used + 1,
            last_check_in_date = v_today,
            updated_at = now()
        WHERE user_id = p_user_id
        RETURNING * INTO v_streak;
      ELSE
        -- Reset streak
        UPDATE daily_streaks
        SET current_streak = 1,
            last_check_in_date = v_today,
            grace_days_used = 0,
            updated_at = now()
        WHERE user_id = p_user_id
        RETURNING * INTO v_streak;
      END IF;
    END IF;
  END IF;

  -- Update profile last_active_at
  UPDATE profiles SET last_active_at = now() WHERE id = p_user_id;

  v_result := jsonb_build_object(
    'current_streak', v_streak.current_streak,
    'longest_streak', v_streak.longest_streak,
    'checked_in_today', true
  );

  RETURN v_result;
END;
$$;

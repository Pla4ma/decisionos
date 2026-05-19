-- Migration: Streak Recovery System
-- Grace days expansion, recovery tracking, forgiveness RPCs

-- Add recovery tracking columns to daily_streaks
ALTER TABLE daily_streaks ADD COLUMN IF NOT EXISTS missed_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE daily_streaks ADD COLUMN IF NOT EXISTS last_welcome_back_shown DATE;
ALTER TABLE daily_streaks ADD COLUMN IF NOT EXISTS recovery_date DATE;

-- Enhanced daily_check_in with 3 grace days and recovery tracking
CREATE OR REPLACE FUNCTION daily_check_in(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_streak RECORD;
  v_missed_days INTEGER;
  v_result JSONB;
BEGIN
  v_today := CURRENT_DATE;
  v_yesterday := v_today - 1;

  SELECT * INTO v_streak FROM daily_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO daily_streaks (user_id, current_streak, longest_streak, last_check_in_date, missed_days, recovery_date)
    VALUES (p_user_id, 1, 1, v_today, 0, NULL)
    RETURNING * INTO v_streak;

    v_result := jsonb_build_object('current_streak', 1, 'longest_streak', 1, 'checked_in_today', true);
    PERFORM update_last_active(p_user_id);
    RETURN v_result;
  END IF;

  IF v_streak.last_check_in_date = v_today THEN
    v_result := jsonb_build_object('current_streak', v_streak.current_streak, 'longest_streak', v_streak.longest_streak, 'checked_in_today', true);
    RETURN v_result;
  END IF;

  v_missed_days := (v_today - v_streak.last_check_in_date) - 1;

  IF v_streak.last_check_in_date = v_yesterday THEN
    UPDATE daily_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_check_in_date = v_today,
        grace_days_used = GREATEST(0, grace_days_used - 1),
        missed_days = 0,
        recovery_date = NULL,
        updated_at = now()
    WHERE user_id = p_user_id
    RETURNING * INTO v_streak;
  ELSE
    IF v_missed_days > 0 AND v_missed_days <= 3 AND v_streak.grace_days_used < 3 THEN
      UPDATE daily_streaks
      SET grace_days_used = grace_days_used + 1,
          last_check_in_date = v_today,
          missed_days = v_missed_days,
          recovery_date = CASE WHEN recovery_date IS NULL THEN v_today ELSE recovery_date END,
          updated_at = now()
      WHERE user_id = p_user_id
      RETURNING * INTO v_streak;
    ELSE
      UPDATE daily_streaks
      SET current_streak = 1,
          longest_streak = GREATEST(longest_streak, current_streak),
          last_check_in_date = v_today,
          grace_days_used = 0,
          missed_days = 0,
          recovery_date = NULL,
          updated_at = now()
      WHERE user_id = p_user_id
      RETURNING * INTO v_streak;
    END IF;
  END IF;

  PERFORM update_last_active(p_user_id);

  v_result := jsonb_build_object('current_streak', v_streak.current_streak, 'longest_streak', v_streak.longest_streak, 'checked_in_today', true);
  RETURN v_result;
END;
$func$;

CREATE OR REPLACE FUNCTION update_last_active(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  UPDATE profiles SET last_active_at = now() WHERE id = p_user_id;
END;
$func$;

CREATE OR REPLACE FUNCTION forgive_streak_grace_day(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_streak RECORD;
  v_today DATE;
  v_result JSONB;
BEGIN
  v_today := CURRENT_DATE;
  SELECT * INTO v_streak FROM daily_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'no_streak');
  END IF;

  IF v_streak.grace_days_used >= 3 THEN
    RETURN jsonb_build_object('error', 'no_grace_remaining');
  END IF;

  UPDATE daily_streaks
  SET grace_days_used = grace_days_used + 1,
      last_check_in_date = v_today,
      missed_days = GREATEST(0, (v_today - v_streak.last_check_in_date) - 1),
      recovery_date = CASE WHEN recovery_date IS NULL THEN v_today ELSE recovery_date END,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_streak;

  PERFORM update_last_active(p_user_id);
  RETURN jsonb_build_object('current_streak', v_streak.current_streak, 'longest_streak', v_streak.longest_streak, 'grace_days_used', v_streak.grace_days_used, 'forgiven', true);
END;
$func$;

CREATE OR REPLACE FUNCTION use_streak_grace_day(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_streak RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_streak FROM user_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'no_streak');
  END IF;

  IF v_streak.grace_days_used >= v_streak.max_grace_days THEN
    RETURN jsonb_build_object('error', 'no_grace_remaining');
  END IF;

  UPDATE user_streaks
  SET grace_days_used = grace_days_used + 1,
      last_updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('grace_used', true, 'grace_days_remaining', v_streak.max_grace_days - v_streak.grace_days_used - 1);
END;
$func$;

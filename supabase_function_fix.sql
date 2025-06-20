
-- FIX: Correct the recalculate_user_analytics function to properly reference variables
-- Run this in Supabase SQL Editor to fix the function

DROP FUNCTION IF EXISTS recalculate_user_analytics(UUID);

CREATE OR REPLACE FUNCTION recalculate_user_analytics(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
    calc_total_questions INTEGER;
    calc_correct_answers INTEGER;
    calc_total_xp INTEGER;
    calc_current_level INTEGER;
    calc_average_score INTEGER;
    calc_total_study_time INTEGER;
BEGIN
    -- Calculate actual stats from quiz_attempts
    SELECT 
        COUNT(*),
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
        SUM(COALESCE(xp_earned, 0)),
        SUM(COALESCE(time_spent, 0))
    INTO 
        calc_total_questions,
        calc_correct_answers, 
        calc_total_xp,
        calc_total_study_time
    FROM quiz_attempts 
    WHERE user_id = target_user_id;
    
    -- Handle case where user has no quiz attempts
    IF calc_total_questions IS NULL THEN
        calc_total_questions := 0;
        calc_correct_answers := 0;
        calc_total_xp := 0;
        calc_total_study_time := 0;
    END IF;
    
    -- Calculate derived values
    calc_current_level := GREATEST(1, (calc_total_xp / 1000) + 1);
    calc_average_score := CASE 
        WHEN calc_total_questions > 0 THEN (calc_correct_answers * 100 / calc_total_questions)
        ELSE 0 
    END;
    
    -- Update user_stats with proper variable references
    UPDATE user_stats 
    SET 
        total_questions = calc_total_questions,
        correct_answers = calc_correct_answers,
        total_xp = calc_total_xp,
        current_level = calc_current_level,
        level = calc_current_level,
        average_score = calc_average_score,
        average_accuracy = calc_average_score,
        total_study_time = GREATEST(0, calc_total_study_time / 60),
        streak = COALESCE(current_streak, 0),
        updated_at = NOW()
    WHERE user_id = target_user_id;
    
    -- Create record if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO user_stats (
            user_id, total_questions, correct_answers, total_xp, 
            current_level, level, current_streak, streak, longest_streak,
            average_score, average_accuracy, total_study_time, rank,
            weekly_xp, monthly_xp, total_badges, study_time_today
        ) VALUES (
            target_user_id, calc_total_questions, calc_correct_answers, calc_total_xp,
            calc_current_level, calc_current_level, 0, 0, 0,
            calc_average_score, calc_average_score, GREATEST(0, calc_total_study_time / 60), 0,
            0, 0, 0, 0
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Test the function works
SELECT recalculate_user_analytics('a45b9d10-e419-4a35-8321-ca57120be2c2'::UUID);

COMMENT ON FUNCTION recalculate_user_analytics IS 'Fixed function that properly calculates user analytics from quiz attempts';

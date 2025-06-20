
-- Fix Analytics Schema Issues
-- This addresses all the missing columns and data type mismatches

-- 1. Fix user_stats table - add missing columns
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_badges INTEGER DEFAULT 0;

-- 2. Fix users table - add missing columns  
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS learning_style TEXT,
ADD COLUMN IF NOT EXISTS goals JSONB,
ADD COLUMN IF NOT EXISTS schedule JSONB,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_study_date TIMESTAMP WITH TIME ZONE;

-- 3. Fix daily_stats table - change date column to proper timestamp type
-- First check if table exists and has data
DO $$
BEGIN
    -- Check if daily_stats table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_stats') THEN
        -- Drop and recreate daily_stats with correct schema
        DROP TABLE IF EXISTS daily_stats;
        
        CREATE TABLE daily_stats (
            id SERIAL PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            date TIMESTAMP WITH TIME ZONE NOT NULL,
            category TEXT,
            questions_answered INTEGER DEFAULT 0,
            correct_answers INTEGER DEFAULT 0,
            xp_earned INTEGER DEFAULT 0,
            study_time INTEGER DEFAULT 0,
            topics_studied JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);
    END IF;
END $$;

-- 4. Fix category_stats table structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'category_stats') THEN
        DROP TABLE IF EXISTS category_stats;
        
        CREATE TABLE category_stats (
            id SERIAL PRIMARY KEY,
            user_id TEXT REFERENCES users(id),
            category_name TEXT NOT NULL,
            questions_answered INTEGER DEFAULT 0,
            correct_answers INTEGER DEFAULT 0,
            accuracy INTEGER DEFAULT 0,
            xp_earned INTEGER DEFAULT 0,
            last_attempted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_category_stats_user_category ON category_stats(user_id, category_name);
    END IF;
END $$;

-- 5. Update existing user_stats records to have consistent data
UPDATE user_stats 
SET 
    streak = COALESCE(current_streak, 0),
    total_badges = 0,
    level = COALESCE(current_level, 1),
    weekly_xp = 0,
    monthly_xp = 0,
    average_accuracy = COALESCE(average_score, 0)
WHERE 
    streak IS NULL 
    OR total_badges IS NULL 
    OR level IS NULL;

-- 6. Ensure all users have stats entries
INSERT INTO user_stats (
    user_id, total_questions, correct_answers, average_score, 
    current_streak, longest_streak, total_xp, current_level, 
    total_study_time, rank, streak, level, weekly_xp, monthly_xp, 
    average_accuracy, total_badges
)
SELECT 
    u.id,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_stats us WHERE us.user_id = u.id
);

-- 7. Create function to recalculate user stats from quiz attempts
CREATE OR REPLACE FUNCTION recalculate_user_analytics(target_user_id TEXT)
RETURNS VOID AS $$
DECLARE
    total_questions INTEGER;
    correct_answers INTEGER;
    total_xp INTEGER;
    current_level INTEGER;
    average_score INTEGER;
    total_study_time INTEGER;
BEGIN
    -- Calculate actual stats from quiz_attempts
    SELECT 
        COUNT(*),
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
        SUM(COALESCE(xp_earned, 0)),
        SUM(COALESCE(time_spent, 0))
    INTO 
        total_questions,
        correct_answers, 
        total_xp,
        total_study_time
    FROM quiz_attempts 
    WHERE user_id = target_user_id;
    
    -- Handle case where user has no quiz attempts
    IF total_questions IS NULL THEN
        total_questions := 0;
        correct_answers := 0;
        total_xp := 0;
        total_study_time := 0;
    END IF;
    
    -- Calculate derived values
    current_level := GREATEST(1, (total_xp / 1000) + 1);
    average_score := CASE 
        WHEN total_questions > 0 THEN (correct_answers * 100 / total_questions)
        ELSE 0 
    END;
    
    -- Update user_stats
    UPDATE user_stats 
    SET 
        total_questions = recalculate_user_analytics.total_questions,
        correct_answers = recalculate_user_analytics.correct_answers,
        total_xp = recalculate_user_analytics.total_xp,
        current_level = recalculate_user_analytics.current_level,
        level = recalculate_user_analytics.current_level,
        average_score = recalculate_user_analytics.average_score,
        average_accuracy = recalculate_user_analytics.average_score,
        total_study_time = GREATEST(0, recalculate_user_analytics.total_study_time / 60),
        updated_at = NOW()
    WHERE user_id = target_user_id;
    
    -- Create record if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO user_stats (
            user_id, total_questions, correct_answers, total_xp, 
            current_level, level, average_score, average_accuracy,
            total_study_time, current_streak, longest_streak, rank,
            streak, weekly_xp, monthly_xp, total_badges
        ) VALUES (
            target_user_id, total_questions, correct_answers, total_xp,
            current_level, current_level, average_score, average_score,
            GREATEST(0, total_study_time / 60), 0, 0, 0,
            0, 0, 0, 0
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Recalculate stats for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM users LOOP
        PERFORM recalculate_user_analytics(user_record.id);
    END LOOP;
END $$;

-- 9. Create triggers to automatically update analytics
CREATE OR REPLACE FUNCTION update_user_analytics_on_quiz()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate analytics whenever a quiz attempt is recorded
    PERFORM recalculate_user_analytics(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS quiz_attempt_analytics_trigger ON quiz_attempts;

-- Create new trigger
CREATE TRIGGER quiz_attempt_analytics_trigger
    AFTER INSERT ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_analytics_on_quiz();

COMMENT ON TABLE user_stats IS 'User performance analytics - automatically updated via triggers';
COMMENT ON FUNCTION recalculate_user_analytics IS 'Recalculates all user analytics from quiz_attempts data';


-- Complete Analytics Schema Fix - Resolves all data type mismatches and missing columns
-- This addresses the UUID vs TEXT foreign key constraint issues

-- 1. First, ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Fix users table - add missing columns with proper types
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
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_study_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 3. Fix user_stats table - ensure proper UUID foreign key and add missing columns
DO $$
BEGIN
    -- Drop existing user_stats table if it has wrong data types
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_stats' 
        AND column_name = 'user_id' 
        AND data_type = 'text'
    ) THEN
        DROP TABLE IF EXISTS user_stats CASCADE;
    END IF;
    
    -- Create user_stats with correct UUID reference
    CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) UNIQUE,
        total_questions INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        total_xp INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        average_score INTEGER DEFAULT 0,
        total_study_time INTEGER DEFAULT 0,
        rank INTEGER DEFAULT 0,
        weekly_xp INTEGER DEFAULT 0,
        monthly_xp INTEGER DEFAULT 0,
        average_accuracy INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak INTEGER DEFAULT 0,
        total_badges INTEGER DEFAULT 0,
        study_time_today INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
END $$;

-- 4. Fix daily_stats table with proper UUID reference
DO $$
BEGIN
    DROP TABLE IF EXISTS daily_stats CASCADE;
    
    CREATE TABLE daily_stats (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
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
END $$;

-- 5. Fix category_stats table with proper UUID reference
DO $$
BEGIN
    DROP TABLE IF EXISTS category_stats CASCADE;
    
    CREATE TABLE category_stats (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        category_name TEXT NOT NULL,
        questions_answered INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        accuracy INTEGER DEFAULT 0,
        xp_earned INTEGER DEFAULT 0,
        last_attempted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_category_stats_user_category ON category_stats(user_id, category_name);
END $$;

-- 6. Fix quiz_attempts table to use UUID reference
DO $$
BEGIN
    -- Check if quiz_attempts exists and has wrong data type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_attempts' 
        AND column_name = 'user_id' 
        AND data_type = 'text'
    ) THEN
        -- Update the column type to UUID
        ALTER TABLE quiz_attempts ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
    END IF;
END $$;

-- 7. Fix leaderboard tables with proper UUID references
DO $$
BEGIN
    -- Fix main leaderboard table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leaderboard') THEN
        DROP TABLE IF EXISTS leaderboard CASCADE;
    END IF;
    
    CREATE TABLE leaderboard (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) UNIQUE,
        rank INTEGER NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        accuracy INTEGER DEFAULT 0,
        category TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Fix global leaderboard table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'global_leaderboard') THEN
        DROP TABLE IF EXISTS global_leaderboard CASCADE;
    END IF;
    
    CREATE TABLE global_leaderboard (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) UNIQUE,
        total_xp INTEGER NOT NULL DEFAULT 0,
        current_level INTEGER NOT NULL DEFAULT 1,
        rank INTEGER NOT NULL,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
END $$;

-- 8. Ensure all users have stats entries
INSERT INTO user_stats (
    user_id, total_questions, correct_answers, average_score, 
    current_streak, longest_streak, total_xp, current_level, 
    total_study_time, rank, streak, level, weekly_xp, monthly_xp, 
    average_accuracy, total_badges, study_time_today
)
SELECT 
    u.id,
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_stats us WHERE us.user_id = u.id
);

-- 9. Create function to recalculate user stats from quiz attempts
CREATE OR REPLACE FUNCTION recalculate_user_analytics(target_user_id UUID)
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
            streak, weekly_xp, monthly_xp, total_badges, study_time_today
        ) VALUES (
            target_user_id, total_questions, correct_answers, total_xp,
            current_level, current_level, average_score, average_score,
            GREATEST(0, total_study_time / 60), 0, 0, 0,
            0, 0, 0, 0, 0
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers to automatically update analytics
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

-- 11. Update full_name for existing users where missing
UPDATE users 
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL OR full_name = '';

-- 12. Create function to automatically maintain full_name
CREATE OR REPLACE FUNCTION update_user_full_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically maintain full_name
DROP TRIGGER IF EXISTS trigger_update_full_name ON users;
CREATE TRIGGER trigger_update_full_name
    BEFORE INSERT OR UPDATE OF first_name, last_name ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_full_name();

-- 13. Enable RLS on new tables
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS policies
CREATE POLICY "Users can view own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own daily stats" ON daily_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own category stats" ON category_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can view global leaderboard" ON global_leaderboard FOR SELECT USING (true);

COMMENT ON TABLE user_stats IS 'User performance analytics with proper UUID references - automatically updated via triggers';
COMMENT ON FUNCTION recalculate_user_analytics IS 'Recalculates all user analytics from quiz_attempts data with UUID parameter';

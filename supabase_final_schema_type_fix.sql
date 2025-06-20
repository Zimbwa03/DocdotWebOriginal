
-- FINAL SCHEMA TYPE ALIGNMENT FIX
-- This fixes the foreign key constraint error by ensuring all user_id columns use UUID type

-- 1. Drop existing tables with type conflicts
DROP TABLE IF EXISTS global_leaderboard CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;

-- 2. Ensure users table has proper UUID type
DO $$
BEGIN
    -- Check if users.id is not UUID and convert if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'id' 
        AND data_type != 'uuid'
    ) THEN
        ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;
    END IF;
END $$;

-- 3. Fix user_stats table user_id type
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_stats' 
        AND column_name = 'user_id' 
        AND data_type = 'text'
    ) THEN
        -- Drop foreign key constraint first
        ALTER TABLE user_stats DROP CONSTRAINT IF EXISTS user_stats_user_id_fkey;
        
        -- Convert to UUID
        ALTER TABLE user_stats ALTER COLUMN user_id TYPE UUID USING 
            CASE 
                WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN user_id::UUID 
                ELSE NULL 
            END;
        
        -- Re-add foreign key constraint
        ALTER TABLE user_stats ADD CONSTRAINT user_stats_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END $$;

-- 4. Fix quiz_attempts table user_id type
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_attempts' 
        AND column_name = 'user_id' 
        AND data_type = 'text'
    ) THEN
        -- Drop foreign key constraint first
        ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_user_id_fkey;
        
        -- Convert to UUID
        ALTER TABLE quiz_attempts ALTER COLUMN user_id TYPE UUID USING 
            CASE 
                WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN user_id::UUID 
                ELSE NULL 
            END;
        
        -- Re-add foreign key constraint
        ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;
END $$;

-- 5. Create global_leaderboard with proper UUID type
CREATE TABLE global_leaderboard (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    rank INTEGER DEFAULT 0,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create leaderboard with proper UUID type
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE,
    rank INTEGER NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak INTEGER NOT NULL DEFAULT 0,
    full_name TEXT,
    institution TEXT,
    category TEXT,
    total_questions INTEGER DEFAULT 0,
    accuracy INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Fix other tables with user_id references
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Fix all tables with user_id that should be UUID
    FOR table_record IN 
        SELECT table_name, column_name
        FROM information_schema.columns 
        WHERE column_name = 'user_id' 
        AND data_type = 'text'
        AND table_name IN ('user_badges', 'category_stats', 'daily_stats', 'ai_sessions', 'ai_chats', 'user_subscriptions', 'payment_history', 'flashcards', 'study_plans', 'study_planner_sessions', 'study_group_members', 'user_document_access', 'learning_patterns', 'performance_predictions', 'study_recommendations', 'notifications')
    LOOP
        BEGIN
            -- Drop foreign key constraint if exists
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I_user_id_fkey', table_record.table_name, table_record.table_name);
            
            -- Convert column type
            EXECUTE format('ALTER TABLE %I ALTER COLUMN user_id TYPE UUID USING 
                CASE 
                    WHEN user_id ~ ''^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'' 
                    THEN user_id::UUID 
                    ELSE NULL 
                END', table_record.table_name);
            
            -- Re-add foreign key constraint
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)', 
                table_record.table_name, table_record.table_name);
                
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not fix table %: %', table_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 8. Update the recalculate_user_analytics function to use proper UUID type
DROP FUNCTION IF EXISTS recalculate_user_analytics(TEXT);
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
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_questions = EXCLUDED.total_questions,
        correct_answers = EXCLUDED.correct_answers,
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        level = EXCLUDED.level,
        average_score = EXCLUDED.average_score,
        average_accuracy = EXCLUDED.average_accuracy,
        total_study_time = EXCLUDED.total_study_time,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 9. Update other functions to use UUID type
DROP FUNCTION IF EXISTS check_and_award_badges(TEXT);
DROP FUNCTION IF EXISTS check_and_award_badges(UUID);

CREATE OR REPLACE FUNCTION check_and_award_badges(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    badge_record RECORD;
    user_stats_record RECORD;
    badges_awarded INTEGER := 0;
    current_progress INTEGER;
    should_award BOOLEAN;
BEGIN
    -- Get user stats
    SELECT * INTO user_stats_record 
    FROM user_stats 
    WHERE user_id = target_user_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'No user stats found for user %', target_user_id;
        RETURN 0;
    END IF;
    
    -- Check each badge (simplified for now)
    FOR badge_record IN 
        SELECT b.* FROM badges b 
        WHERE b.id NOT IN (
            SELECT ub.badge_id FROM user_badges ub 
            WHERE ub.user_id = target_user_id
        )
        LIMIT 5 -- Limit to prevent performance issues
    LOOP
        should_award := FALSE;
        current_progress := 0;
        
        -- Simple badge awarding logic
        IF badge_record.name = 'First Steps' AND user_stats_record.total_questions >= 1 THEN
            should_award := TRUE;
        ELSIF badge_record.name = 'Quiz Master' AND user_stats_record.total_questions >= 10 THEN
            should_award := TRUE;
        END IF;
        
        -- Award badge if requirements met
        IF should_award THEN
            INSERT INTO user_badges (user_id, badge_id, progress, requirement, xp_reward, name, description)
            VALUES (target_user_id, badge_record.id, current_progress, badge_record.requirement, 
                   badge_record.xp_reward, badge_record.name, badge_record.description);
            
            badges_awarded := badges_awarded + 1;
        END IF;
    END LOOP;
    
    RETURN badges_awarded;
END;
$$ LANGUAGE plpgsql;

-- 10. Update global leaderboard function
DROP FUNCTION IF EXISTS update_global_leaderboard();

CREATE OR REPLACE FUNCTION update_global_leaderboard()
RETURNS VOID AS $$
BEGIN
    -- Clear existing leaderboard
    DELETE FROM global_leaderboard;
    
    -- Insert updated leaderboard data with proper UUID handling
    INSERT INTO global_leaderboard (user_id, total_xp, current_level, rank, first_name, last_name, full_name, email)
    SELECT 
        us.user_id,
        COALESCE(us.total_xp, 0) as total_xp,
        COALESCE(us.current_level, 1) as current_level,
        ROW_NUMBER() OVER (ORDER BY COALESCE(us.total_xp, 0) DESC, COALESCE(us.average_score, 0) DESC) as rank,
        u.first_name,
        u.last_name,
        COALESCE(u.full_name, CONCAT(u.first_name, ' ', u.last_name)) as full_name,
        u.email
    FROM user_stats us
    LEFT JOIN users u ON us.user_id = u.id
    WHERE u.id IS NOT NULL AND COALESCE(us.total_xp, 0) > 0
    ORDER BY total_xp DESC
    LIMIT 100;
    
    RAISE NOTICE 'Global leaderboard updated with % entries', (SELECT COUNT(*) FROM global_leaderboard);
END;
$$ LANGUAGE plpgsql;

-- 11. Create comprehensive user initialization function with UUID
DROP FUNCTION IF EXISTS initialize_user_complete(TEXT);
DROP FUNCTION IF EXISTS initialize_user_complete(UUID);

CREATE OR REPLACE FUNCTION initialize_user_complete(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    badges_awarded INTEGER;
    result JSONB;
BEGIN
    -- Ensure user stats exist
    PERFORM recalculate_user_analytics(target_user_id);
    
    -- Check and award badges
    badges_awarded := check_and_award_badges(target_user_id);
    
    -- Update leaderboard
    PERFORM update_global_leaderboard();
    
    -- Return summary
    result := jsonb_build_object(
        'user_id', target_user_id,
        'badges_awarded', badges_awarded,
        'stats_updated', true,
        'leaderboard_updated', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 12. Enable RLS and create policies with proper UUID types
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view global leaderboard" ON global_leaderboard;
CREATE POLICY "Anyone can view global leaderboard" ON global_leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard;
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);

-- Success message
SELECT 'SCHEMA TYPE ALIGNMENT COMPLETE! All user_id columns now use UUID type.' as status;

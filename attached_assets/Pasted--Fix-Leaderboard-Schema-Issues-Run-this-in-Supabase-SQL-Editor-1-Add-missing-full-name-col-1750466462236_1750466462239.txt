-- Fix Leaderboard Schema Issues
-- Run this in Supabase SQL Editor

-- 1. Add missing full_name column to global_leaderboard
ALTER TABLE global_leaderboard 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Drop and recreate the global leaderboard update function with correct schema
DROP FUNCTION IF EXISTS update_global_leaderboard();

CREATE OR REPLACE FUNCTION update_global_leaderboard()
RETURNS void AS $$
BEGIN
    -- Clear existing global leaderboard data
    DELETE FROM global_leaderboard;
    
    -- Insert fresh data with correct column references
    INSERT INTO global_leaderboard (user_id, total_xp, current_level, rank, first_name, last_name, email)
    SELECT 
        us.user_id,
        COALESCE(us.total_xp, 0) as total_xp,
        COALESCE(us.current_level, 1) as current_level,
        ROW_NUMBER() OVER (ORDER BY COALESCE(us.total_xp, 0) DESC, COALESCE(us.average_score, 0) DESC) as rank,
        u.first_name,
        u.last_name,
        u.email
    FROM user_stats us
    LEFT JOIN users u ON us.user_id = u.id
    WHERE u.id IS NOT NULL AND COALESCE(us.total_xp, 0) > 0
    ORDER BY total_xp DESC
    LIMIT 100;
    
    -- Update full_name column after insert
    UPDATE global_leaderboard 
    SET full_name = COALESCE(first_name || ' ' || last_name, email);
END;
$$ LANGUAGE plpgsql;

-- 3. Update leaderboard rankings function to handle missing columns gracefully
CREATE OR REPLACE FUNCTION update_leaderboard_rankings()
RETURNS void AS $$
BEGIN
    -- Update leaderboard ranks based on XP
    WITH ranked_users AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY xp DESC, user_id) as new_rank
        FROM leaderboard
        WHERE user_id IS NOT NULL
    )
    UPDATE leaderboard 
    SET rank = ranked_users.new_rank,
        updated_at = now()
    FROM ranked_users 
    WHERE leaderboard.user_id = ranked_users.user_id;
    
    -- Update global leaderboard ranks
    WITH ranked_global AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY total_xp DESC, user_id) as new_rank
        FROM global_leaderboard
        WHERE user_id IS NOT NULL
    )
    UPDATE global_leaderboard 
    SET rank = ranked_global.new_rank,
        updated_at = now()
    FROM ranked_global 
    WHERE global_leaderboard.user_id = ranked_global.user_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a simple function to get leaderboard data without complex joins
CREATE OR REPLACE FUNCTION get_leaderboard_entries(
    entry_limit INTEGER DEFAULT 50,
    time_frame TEXT DEFAULT 'all-time',
    category_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
    user_id UUID,
    rank INTEGER,
    xp INTEGER,
    level INTEGER,
    streak INTEGER,
    full_name TEXT,
    institution TEXT,
    category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.user_id,
        l.rank,
        l.xp,
        l.level,
        l.streak,
        l.full_name,
        l.institution,
        l.category
    FROM leaderboard l
    WHERE 
        (category_filter = 'all' OR l.category = category_filter)
        AND l.user_id IS NOT NULL
    ORDER BY l.rank ASC
    LIMIT entry_limit;
END;
$$ LANGUAGE plpgsql;

-- 5. Populate some initial leaderboard data for testing
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get a sample user ID if any exist
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Only insert sample data if we have users
    IF sample_user_id IS NOT NULL THEN
        -- Insert into leaderboard if not exists
        INSERT INTO leaderboard (user_id, rank, xp, level, streak, full_name, institution, category)
        VALUES (sample_user_id, 1, 1500, 5, 7, 'Test User', 'Medical University', 'Anatomy')
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Insert into global_leaderboard if not exists
        INSERT INTO global_leaderboard (user_id, total_xp, current_level, rank, first_name, last_name, email, full_name)
        VALUES (sample_user_id, 1500, 5, 1, 'Test', 'User', 'test@example.com', 'Test User')
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

COMMIT;
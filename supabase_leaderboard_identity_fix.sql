

-- Fix identity column type error and leaderboard table structure
-- Run this in Supabase SQL Editor

-- 1. Drop existing tables with identity column issues
DROP TABLE IF EXISTS global_leaderboard CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;

-- 2. Create global_leaderboard with proper SERIAL (integer) identity column and UUID user_id
CREATE TABLE global_leaderboard (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    rank INTEGER NOT NULL DEFAULT 0,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create leaderboard with proper SERIAL (integer) identity column and UUID user_id
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE,
    rank INTEGER NOT NULL DEFAULT 0,
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

-- 4. Enable RLS
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Anyone can view global leaderboard" ON global_leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view leaderboard" ON leaderboard
    FOR SELECT USING (true);

-- 6. Create indexes for performance
CREATE INDEX idx_global_leaderboard_rank ON global_leaderboard(rank);
CREATE INDEX idx_global_leaderboard_xp ON global_leaderboard(total_xp DESC);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_category_rank ON leaderboard(category, rank);

-- 7. Populate leaderboard with existing user data
INSERT INTO global_leaderboard (user_id, total_xp, current_level, rank, first_name, last_name, full_name, email)
SELECT 
    us.user_id,
    us.total_xp,
    us.current_level,
    ROW_NUMBER() OVER (ORDER BY us.total_xp DESC, us.current_level DESC) as rank,
    u.first_name,
    u.last_name,
    u.full_name,
    u.email
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE us.total_xp > 0
ON CONFLICT (user_id) DO UPDATE SET
    total_xp = EXCLUDED.total_xp,
    current_level = EXCLUDED.current_level,
    rank = EXCLUDED.rank,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- 8. Populate main leaderboard
INSERT INTO leaderboard (user_id, rank, xp, level, streak, full_name, institution, total_questions, accuracy, score)
SELECT 
    us.user_id,
    ROW_NUMBER() OVER (ORDER BY us.total_xp DESC, us.current_level DESC) as rank,
    us.total_xp,
    us.current_level,
    us.current_streak,
    u.full_name,
    u.institution,
    us.total_questions,
    us.average_accuracy,
    us.total_xp
FROM user_stats us
JOIN users u ON us.user_id = u.id
WHERE us.total_xp > 0
ON CONFLICT (user_id) DO UPDATE SET
    rank = EXCLUDED.rank,
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    streak = EXCLUDED.streak,
    full_name = EXCLUDED.full_name,
    institution = EXCLUDED.institution,
    total_questions = EXCLUDED.total_questions,
    accuracy = EXCLUDED.accuracy,
    score = EXCLUDED.score,
    updated_at = NOW();

-- Success message
SELECT 'Leaderboard tables fixed with proper UUID identity columns and populated with data!' as status;

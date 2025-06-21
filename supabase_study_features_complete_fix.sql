-- Complete SQL fix for Study Planner, Study Groups, and Leaderboard
-- Run this in Supabase SQL Editor

-- 1. Fix Study Groups table structure
DROP TABLE IF EXISTS study_groups CASCADE;
CREATE TABLE study_groups (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES auth.users(id),
    meeting_link TEXT,
    meeting_type TEXT DEFAULT 'zoom',
    scheduled_time TIMESTAMPTZ,
    duration INTEGER DEFAULT 60,
    max_members INTEGER DEFAULT 10,
    current_members INTEGER DEFAULT 1,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Study Group Members table
DROP TABLE IF EXISTS study_group_members CASCADE;
CREATE TABLE study_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    joined_at TIMESTAMPTZ DEFAULT now(),
    has_joined_meeting BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false
);

-- 3. Fix Study Planner Sessions table
DROP TABLE IF EXISTS study_planner_sessions CASCADE;
CREATE TABLE study_planner_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    subject TEXT,
    topic TEXT,
    date TIMESTAMPTZ NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration INTEGER DEFAULT 60,
    notes TEXT,
    status TEXT DEFAULT 'planned',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Fix Leaderboard table structure
DROP TABLE IF EXISTS leaderboard CASCADE;
CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    rank INTEGER NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak INTEGER NOT NULL DEFAULT 0,
    full_name TEXT,
    institution TEXT,
    category TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Fix Global Leaderboard table
DROP TABLE IF EXISTS global_leaderboard CASCADE;
CREATE TABLE global_leaderboard (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    rank INTEGER NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create indexes for better performance
CREATE INDEX idx_study_groups_creator ON study_groups(creator_id);
CREATE INDEX idx_study_groups_category ON study_groups(category);
CREATE INDEX idx_study_groups_scheduled ON study_groups(scheduled_time);
CREATE INDEX idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX idx_study_planner_user ON study_planner_sessions(user_id);
CREATE INDEX idx_study_planner_date ON study_planner_sessions(date);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_xp ON leaderboard(xp DESC);
CREATE INDEX idx_global_leaderboard_rank ON global_leaderboard(rank);

-- 7. Enable Row Level Security
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_planner_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for Study Groups
CREATE POLICY "Users can view all study groups" ON study_groups
    FOR SELECT USING (true);

CREATE POLICY "Users can create study groups" ON study_groups
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their study groups" ON study_groups
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their study groups" ON study_groups
    FOR DELETE USING (auth.uid() = creator_id);

-- 9. Create RLS policies for Study Group Members
CREATE POLICY "Users can view group memberships" ON study_group_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON study_group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their memberships" ON study_group_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON study_group_members
    FOR DELETE USING (auth.uid() = user_id);

-- 10. Create RLS policies for Study Planner Sessions
CREATE POLICY "Users can view their own study sessions" ON study_planner_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study sessions" ON study_planner_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_planner_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON study_planner_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- 11. Create RLS policies for Leaderboard (read-only for users)
CREATE POLICY "Users can view leaderboard" ON leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can view global leaderboard" ON global_leaderboard
    FOR SELECT USING (true);

-- 12. Insert sample data for testing (only if users exist)
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get a sample user ID if any exist
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- Only insert sample data if we have users
    IF sample_user_id IS NOT NULL THEN
        INSERT INTO study_groups (title, description, creator_id, meeting_link, meeting_type, scheduled_time, duration, max_members, category)
        VALUES 
            ('Anatomy Study Group', 'Weekly anatomy review sessions', sample_user_id, 'https://meet.google.com/abc-def-ghi', 'meet', now() + interval '1 day', 90, 8, 'Anatomy'),
            ('Physiology Discussion', 'Interactive physiology learning', sample_user_id, 'https://zoom.us/j/123456789', 'zoom', now() + interval '2 days', 120, 10, 'Physiology');
    END IF;
END $$;

-- 13. Update trigger function for study planner sessions
CREATE OR REPLACE FUNCTION update_study_planner_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_planner_sessions_updated_at
    BEFORE UPDATE ON study_planner_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_study_planner_updated_at();

-- 14. Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION update_leaderboard_rankings()
RETURNS void AS $$
BEGIN
    -- Update leaderboard ranks based on XP
    WITH ranked_users AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY xp DESC, user_id) as new_rank
        FROM leaderboard
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
    )
    UPDATE global_leaderboard 
    SET rank = ranked_global.new_rank,
        updated_at = now()
    FROM ranked_global 
    WHERE global_leaderboard.user_id = ranked_global.user_id;
END;
$$ LANGUAGE plpgsql;

-- 15. Grant necessary permissions
GRANT ALL ON study_groups TO authenticated;
GRANT ALL ON study_group_members TO authenticated;
GRANT ALL ON study_planner_sessions TO authenticated;
GRANT SELECT ON leaderboard TO authenticated;
GRANT SELECT ON global_leaderboard TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;
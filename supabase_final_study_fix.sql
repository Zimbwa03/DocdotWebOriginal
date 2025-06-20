
-- Final Fix for Study Planner and Study Groups
-- Run this in Supabase SQL Editor to complete the setup

-- Add missing columns to study_planner_sessions
ALTER TABLE study_planner_sessions 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned',
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS productivity_rating INTEGER;

-- Fix study_groups table - ensure proper ID generation
ALTER TABLE study_groups 
ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;

-- Ensure all required columns exist
ALTER TABLE study_groups 
ADD COLUMN IF NOT EXISTS creator_name TEXT;

-- Update the study_groups table to have proper creator names
UPDATE study_groups sg 
SET creator_name = u.full_name 
FROM users u 
WHERE sg.creator_id = u.id AND sg.creator_name IS NULL;

-- Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_status ON study_planner_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_study_groups_creator ON study_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_active ON study_groups(is_active, scheduled_time);

-- Update RLS policies for study_planner_sessions
DROP POLICY IF EXISTS "Users can manage own study sessions" ON study_planner_sessions;

CREATE POLICY "Users can view own study sessions" ON study_planner_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study sessions" ON study_planner_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Update RLS policies for study_groups
DROP POLICY IF EXISTS "Users can view study groups" ON study_groups;
DROP POLICY IF EXISTS "Users can manage own study groups" ON study_groups;

CREATE POLICY "Users can view all study groups" ON study_groups
    FOR SELECT USING (true);

CREATE POLICY "Users can create study groups" ON study_groups
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own study groups" ON study_groups
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own study groups" ON study_groups
    FOR DELETE USING (auth.uid() = creator_id);

-- Success message
SELECT 'Study Planner and Study Groups fully functional!' as status;

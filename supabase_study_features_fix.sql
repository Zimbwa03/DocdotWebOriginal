
-- Fix Study Planner and Study Groups Schema Issues
-- This script adds missing columns and ensures proper table structure

-- Fix study_planner_sessions table
ALTER TABLE study_planner_sessions 
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS topic TEXT;

-- Ensure all required columns exist with proper defaults
ALTER TABLE study_planner_sessions 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN start_time SET NOT NULL,
ALTER COLUMN end_time SET NOT NULL;

-- Fix study_groups table - add missing columns
ALTER TABLE study_groups 
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled Study Group',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'zoom',
ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS current_members INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Remove default constraint from title after adding it
ALTER TABLE study_groups ALTER COLUMN title DROP DEFAULT;

-- Ensure study_group_members table exists
CREATE TABLE IF NOT EXISTS study_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    has_joined_meeting BOOLEAN DEFAULT false,
    UNIQUE(group_id, user_id)
);

-- Create meeting_reminders table if it doesn't exist
CREATE TABLE IF NOT EXISTS meeting_reminders (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_planner_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_study_groups_scheduled_time ON study_groups(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_reminders_time ON meeting_reminders(reminder_time) WHERE sent = false;

-- Enable RLS on new tables
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_reminders ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for study_group_members
CREATE POLICY "Users can view group memberships" ON study_group_members
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own memberships" ON study_group_members
    FOR ALL USING (auth.uid() = user_id);

-- Add RLS policies for meeting_reminders
CREATE POLICY "Users can view own reminders" ON meeting_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage reminders" ON meeting_reminders
    FOR ALL USING (true);

-- Update existing study_groups to have proper structure
UPDATE study_groups SET 
    current_members = 1 
WHERE current_members IS NULL;

UPDATE study_groups SET 
    max_members = 10 
WHERE max_members IS NULL;

UPDATE study_groups SET 
    duration = 60 
WHERE duration IS NULL;

UPDATE study_groups SET 
    is_active = false 
WHERE is_active IS NULL;

-- Success message
SELECT 'Study Planner and Study Groups schema fixed successfully!' as status;

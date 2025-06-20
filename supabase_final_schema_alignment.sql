
-- FINAL SCHEMA ALIGNMENT - Run this in Supabase SQL Editor to ensure complete compatibility

-- Add ALL missing columns to users table that the application expects
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_style TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS goals JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS schedule JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_study_date TIMESTAMP WITH TIME ZONE;

-- Ensure user_stats has all required columns
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS monthly_xp INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS average_accuracy INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_badges INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS study_time_today INTEGER DEFAULT 0;

-- Update existing data to ensure consistency
UPDATE users SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL OR full_name = '';
UPDATE user_stats SET level = current_level WHERE level IS NULL OR level = 0;
UPDATE user_stats SET streak = current_streak WHERE streak IS NULL;

-- Ensure proper data types for compatibility
ALTER TABLE quiz_attempts ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

COMMENT ON TABLE users IS 'Users table with complete schema alignment - all expected columns present';

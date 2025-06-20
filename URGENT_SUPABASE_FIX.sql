-- URGENT: Add missing columns to fix authentication
-- Copy and paste this entire script into your Supabase SQL Editor and run it

-- Add all missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_of_study INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS university TEXT;

-- Add missing columns to user_stats table
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Import ALL existing Supabase Auth users into your application database
INSERT INTO users (id, email, first_name, last_name, full_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'last_name', ''),
    COALESCE(
        TRIM(COALESCE(au.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(au.raw_user_meta_data->>'last_name', '')),
        split_part(au.email, '@', 1)
    ),
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    updated_at = EXCLUDED.updated_at;

-- Create user_stats for all users who don't have them
INSERT INTO user_stats (user_id, total_questions, correct_answers, total_xp, current_level, level, weekly_xp, monthly_xp, average_accuracy, average_score)
SELECT 
    u.id, 0, 0, 0, 1, 1, 0, 0, 0, 0
FROM users u
WHERE u.id NOT IN (SELECT user_id FROM user_stats WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Update existing data for consistency
UPDATE users SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL OR full_name = '';
UPDATE user_stats SET level = current_level WHERE level IS NULL;
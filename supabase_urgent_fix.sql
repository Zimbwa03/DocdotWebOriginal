-- Urgent fix - Add all missing columns immediately
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_of_study INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS university TEXT;

-- Add missing column to user_stats
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Update existing data
UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, '') WHERE full_name IS NULL OR full_name = '';
UPDATE user_stats SET level = current_level WHERE level IS NULL;

-- Import existing Supabase Auth users into application users table
INSERT INTO users (id, email, first_name, last_name, full_name, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'last_name', ''),
    COALESCE(
        au.raw_user_meta_data->>'first_name' || ' ' || au.raw_user_meta_data->>'last_name',
        split_part(au.email, '@', 1)
    ),
    au.created_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
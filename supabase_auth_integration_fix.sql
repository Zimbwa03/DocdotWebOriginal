-- Complete authentication integration and missing columns fix

-- Add ALL missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_of_study INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS university TEXT;

-- Add missing columns to user_stats table  
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Update existing data
UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, '') WHERE full_name IS NULL;
UPDATE user_stats SET level = current_level WHERE level IS NULL;

-- Sync existing Supabase Auth users with application users table
INSERT INTO users (id, email, first_name, last_name, full_name, created_at, updated_at)
SELECT 
    auth.users.id,
    auth.users.email,
    COALESCE(auth.users.raw_user_meta_data->>'first_name', split_part(auth.users.email, '@', 1)),
    COALESCE(auth.users.raw_user_meta_data->>'last_name', ''),
    COALESCE(
        auth.users.raw_user_meta_data->>'first_name' || ' ' || auth.users.raw_user_meta_data->>'last_name',
        split_part(auth.users.email, '@', 1)
    ),
    auth.users.created_at,
    auth.users.updated_at
FROM auth.users
WHERE auth.users.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = EXCLUDED.updated_at;

-- Create user_stats for all existing users who don't have them
INSERT INTO user_stats (user_id, total_questions, correct_answers, total_xp, current_level, level, weekly_xp, monthly_xp, average_accuracy)
SELECT 
    u.id,
    0, 0, 0, 1, 1, 0, 0, 0
FROM users u
WHERE u.id NOT IN (SELECT user_id FROM user_stats WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Function to sync new Supabase Auth users with application users table
CREATE OR REPLACE FUNCTION sync_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(
            NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        updated_at = EXCLUDED.updated_at;
    
    -- Also create user_stats
    INSERT INTO public.user_stats (user_id, total_questions, correct_answers, total_xp, current_level, level)
    VALUES (NEW.id, 0, 0, 0, 1, 1)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync Auth users with application users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_auth_user();

-- Enable Row Level Security and create policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for proper authentication integration
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own stats" ON user_stats;
CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);

-- Allow service role to bypass RLS for API operations
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
CREATE POLICY "Service role can manage all users" ON users FOR ALL USING (current_setting('role') = 'service_role');

DROP POLICY IF EXISTS "Service role can manage all user_stats" ON user_stats;
CREATE POLICY "Service role can manage all user_stats" ON user_stats FOR ALL USING (current_setting('role') = 'service_role');
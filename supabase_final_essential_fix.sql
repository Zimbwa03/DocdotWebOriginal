-- Essential columns fix - Run this in Supabase SQL Editor
ALTER TABLE users ADD COLUMN specialization TEXT;
ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE user_stats ADD COLUMN level INTEGER DEFAULT 1;

-- Sync existing Auth users with application database
INSERT INTO users (id, email, first_name, last_name, full_name, created_at)
SELECT 
    id, email,
    COALESCE(raw_user_meta_data->>'first_name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'last_name', ''),
    COALESCE(raw_user_meta_data->>'first_name' || ' ' || raw_user_meta_data->>'last_name', split_part(email, '@', 1)),
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
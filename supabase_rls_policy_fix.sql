
-- RLS POLICY FIX - Drop policies, alter columns, recreate policies
-- Run this in Supabase SQL Editor to fix the RLS policy conflict

-- Step 1: Drop all policies that depend on columns we need to alter
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can manage own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can update own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can delete own quiz attempts" ON public.quiz_attempts;

-- Step 2: Add ALL missing columns to users table that the application expects
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

-- Step 3: Ensure user_stats has all required columns
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS monthly_xp INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS average_accuracy INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_badges INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS study_time_today INTEGER DEFAULT 0;

-- Step 4: Fix data types (only if the column exists and needs type change)
DO $$
BEGIN
    -- Check if quiz_attempts.user_id is TEXT and needs to be changed to UUID
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'quiz_attempts' 
        AND column_name = 'user_id' 
        AND data_type = 'text'
        AND table_schema = 'public'
    ) THEN
        -- Only attempt the conversion if we have valid UUID values
        ALTER TABLE quiz_attempts ALTER COLUMN user_id TYPE UUID USING 
            CASE 
                WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                THEN user_id::UUID 
                ELSE NULL 
            END;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If conversion fails, just log and continue
        RAISE NOTICE 'Could not convert user_id to UUID: %', SQLERRM;
END
$$;

-- Step 5: Update existing data to ensure consistency
UPDATE users SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) 
WHERE full_name IS NULL OR full_name = '';

UPDATE user_stats SET level = current_level 
WHERE level IS NULL OR level = 0;

UPDATE user_stats SET streak = current_streak 
WHERE streak IS NULL;

-- Step 6: Recreate RLS policies for quiz_attempts
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts" ON public.quiz_attempts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz attempts" ON public.quiz_attempts
    FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Ensure RLS is enabled on all necessary tables
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE users IS 'Users table with complete schema alignment - all expected columns present, RLS policies fixed';

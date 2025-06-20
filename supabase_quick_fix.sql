-- Quick Fix for Supabase Schema Issues
-- This addresses the specific errors you're experiencing

-- Add missing columns to user_stats table
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS monthly_xp INTEGER DEFAULT 0;

-- Add missing columns to users table  
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add missing columns to quiz_attempts table
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS correct_answer TEXT DEFAULT '';
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

-- Create global_leaderboard table
CREATE TABLE IF NOT EXISTS global_leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  first_name TEXT,
  last_name TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create category_stats table
CREATE TABLE IF NOT EXISTS category_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_name TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  last_attempted TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date TEXT NOT NULL,
  category TEXT,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  study_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
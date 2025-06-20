
-- =====================================================
-- SUPABASE SCHEMA COMPLETE FIX
-- This fixes all missing columns and schema mismatches
-- =====================================================

-- First, let's ensure we have the proper extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix users table - add missing columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS learning_style TEXT,
ADD COLUMN IF NOT EXISTS goals TEXT[],
ADD COLUMN IF NOT EXISTS schedule JSONB,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Update existing users table structure
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();

-- Fix user_stats table - add missing columns
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_answers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_study_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_accuracy INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_badges INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_time_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure quiz_attempts table exists with proper structure
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  quiz_id INTEGER,
  question_identifier TEXT,
  category TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'medium',
  xp_earned INTEGER DEFAULT 0,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure leaderboard table exists
CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category TEXT,
  rank INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure global_leaderboard table exists
CREATE TABLE IF NOT EXISTS global_leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  rank INTEGER DEFAULT 0,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure badges table exists
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT,
  tier TEXT DEFAULT 'bronze',
  requirement INTEGER DEFAULT 1,
  requirement_type TEXT DEFAULT 'questions',
  xp_reward INTEGER DEFAULT 50,
  color TEXT DEFAULT '#CD7F32',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure user_badges table exists
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_id INTEGER REFERENCES badges(id),
  progress INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Ensure category_stats table exists
CREATE TABLE IF NOT EXISTS category_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category TEXT NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  last_attempted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix daily_stats table structure
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  category TEXT,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  study_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure AI-related tables exist
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  tool_type TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES ai_sessions(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample badges
INSERT INTO badges (name, description, icon, category, tier, requirement, requirement_type, xp_reward, color) VALUES
('First Steps', 'Complete your first quiz', 'Trophy', 'performance', 'bronze', 1, 'questions', 50, '#CD7F32'),
('Quick Learner', 'Answer 10 questions correctly', 'Zap', 'performance', 'bronze', 10, 'questions', 100, '#CD7F32'),
('Streak Master', 'Maintain a 7-day study streak', 'Flame', 'streak', 'silver', 7, 'streak', 200, '#C0C0C0'),
('Accuracy Expert', 'Achieve 90% accuracy in 50+ questions', 'Target', 'mastery', 'gold', 90, 'accuracy', 500, '#FFD700'),
('Study Marathon', 'Study for 10 hours total', 'Clock', 'time', 'silver', 600, 'time', 300, '#C0C0C0'),
('Knowledge Seeker', 'Earn 1000 XP', 'Star', 'performance', 'gold', 1000, 'xp', 1000, '#FFD700')
ON CONFLICT (name) DO NOTHING;

-- Create categories if they don't exist
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert medical categories
INSERT INTO categories (name, description, icon, order_index) VALUES
('Anatomy', 'Human body structure and organization', 'User', 1),
('Physiology', 'Body functions and processes', 'Activity', 2),
('Pathology', 'Disease processes and mechanisms', 'AlertTriangle', 3),
('Pharmacology', 'Drug actions and interactions', 'Pill', 4),
('Microbiology', 'Microorganisms and infections', 'Bug', 5),
('Biochemistry', 'Chemical processes in living organisms', 'Atom', 6)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_attempted_at ON quiz_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_global_leaderboard_rank ON global_leaderboard(rank);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own stats" ON user_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badges" ON user_badges
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard" ON leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can view global leaderboard" ON global_leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can view own category stats" ON category_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily stats" ON daily_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI sessions" ON ai_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI chats" ON ai_chats
    FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON SCHEMA public IS 'DocDot Medical Education Platform - Schema Fixed - Complete database structure for medical education app';

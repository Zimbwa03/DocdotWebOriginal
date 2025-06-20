-- Complete Supabase Schema for DocDot Medical Education Platform
-- WARNING: This will DROP all existing tables and recreate them with clean data
-- Only run this if you want to completely reset your database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all existing tables (in correct order to handle foreign key constraints)
DROP TABLE IF EXISTS meeting_reminders CASCADE;
DROP TABLE IF EXISTS study_group_members CASCADE;
DROP TABLE IF EXISTS study_groups CASCADE;
DROP TABLE IF EXISTS study_planner_sessions CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS study_plans CASCADE;
DROP TABLE IF EXISTS user_analytics CASCADE;
DROP TABLE IF EXISTS ai_chats CASCADE;
DROP TABLE IF EXISTS ai_sessions CASCADE;
DROP TABLE IF EXISTS exam_generation_history CASCADE;
DROP TABLE IF EXISTS custom_exam_attempts CASCADE;
DROP TABLE IF EXISTS stem_options CASCADE;
DROP TABLE IF EXISTS custom_exam_stems CASCADE;
DROP TABLE IF EXISTS custom_exams CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS global_leaderboard CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS category_stats CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table - Core user information
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table with all required columns
CREATE TABLE quiz_attempts (
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

-- User statistics table with all required columns
CREATE TABLE user_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0,
  average_accuracy INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Category statistics table
CREATE TABLE category_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_name TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  last_attempted TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily statistics table
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date TEXT NOT NULL,
  category TEXT,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  study_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  topics_studied JSONB
);

-- Leaderboard table
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  achievements TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global leaderboard table
CREATE TABLE global_leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  first_name TEXT,
  last_name TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table with all required columns
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement JSONB,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_id INTEGER REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table (for AI-generated questions)
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium',
  category TEXT,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom exams table
CREATE TABLE custom_exams (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  topics JSONB,
  stem_count INTEGER DEFAULT 10,
  time_limit INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom exam stems table
CREATE TABLE custom_exam_stems (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES custom_exams(id),
  stem_text TEXT NOT NULL,
  explanation TEXT,
  source_citation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stem options table
CREATE TABLE stem_options (
  id SERIAL PRIMARY KEY,
  stem_id INTEGER REFERENCES custom_exam_stems(id),
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom exam attempts table
CREATE TABLE custom_exam_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exam_id INTEGER REFERENCES custom_exams(id),
  answers JSONB,
  score INTEGER,
  total_stems INTEGER,
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam generation history table
CREATE TABLE exam_generation_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exam_type TEXT NOT NULL,
  topics JSONB,
  stem_count INTEGER,
  ai_model TEXT DEFAULT 'deepseek',
  generation_time INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI sessions table with all columns
CREATE TABLE ai_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_type TEXT,
  title TEXT,
  last_message TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- AI chats table with all columns
CREATE TABLE ai_chats (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES ai_sessions(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Study planner sessions table
CREATE TABLE study_planner_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'scheduled',
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study groups table
CREATE TABLE study_groups (
  id TEXT PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 1,
  meeting_link TEXT,
  meeting_type TEXT DEFAULT 'zoom',
  scheduled_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study group members table
CREATE TABLE study_group_members (
  id SERIAL PRIMARY KEY,
  group_id TEXT REFERENCES study_groups(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  has_joined_meeting BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE
);

-- Meeting reminders table
CREATE TABLE meeting_reminders (
  id SERIAL PRIMARY KEY,
  group_id TEXT REFERENCES study_groups(id),
  user_id UUID REFERENCES users(id),
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User analytics table
CREATE TABLE user_analytics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_count INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE flashcards (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  category TEXT,
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study plans table
CREATE TABLE study_plans (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  goals JSONB,
  schedule JSONB,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_category ON quiz_attempts(category);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_category_stats_user_id ON category_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard(xp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_session_id ON ai_chats(session_id);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Anatomy', 'Human anatomy and anatomical structures'),
('Physiology', 'Human physiology and body functions'),
('Pathology', 'Disease processes and pathological conditions'),
('Pharmacology', 'Drugs and their effects on the human body'),
('Microbiology', 'Study of microorganisms and infectious diseases');

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category) VALUES
('First Quiz', 'Complete your first quiz', '🎯', '{"type": "quiz_count", "value": 1}'::jsonb, 10, 'common', 'achievement'),
('Quiz Master', 'Complete 100 quizzes', '🏆', '{"type": "quiz_count", "value": 100}'::jsonb, 100, 'legendary', 'achievement'),
('Streak Keeper', 'Maintain a 7-day study streak', '🔥', '{"type": "streak", "value": 7}'::jsonb, 50, 'rare', 'streak'),
('Speed Demon', 'Answer 10 questions in under 30 seconds each', '⚡', '{"type": "speed", "value": 10}'::jsonb, 25, 'rare', 'performance'),
('Perfectionist', 'Get 50 questions correct in a row', '💎', '{"type": "streak_correct", "value": 50}'::jsonb, 75, 'epic', 'achievement'),
('Night Owl', 'Study after 10 PM for 5 consecutive days', '🦉', '{"type": "night_study", "value": 5}'::jsonb, 30, 'uncommon', 'habit'),
('Early Bird', 'Study before 7 AM for 5 consecutive days', '🐦', '{"type": "morning_study", "value": 5}'::jsonb, 30, 'uncommon', 'habit'),
('Scholar', 'Reach level 10', '📚', '{"type": "level", "value": 10}'::jsonb, 100, 'epic', 'milestone'),
('Anatomy Expert', 'Score 90% or higher on 25 anatomy questions', '🦴', '{"type": "category_mastery", "category": "anatomy", "accuracy": 90, "count": 25}'::jsonb, 50, 'rare', 'expertise'),
('Physiology Master', 'Score 90% or higher on 25 physiology questions', '❤️', '{"type": "category_mastery", "category": "physiology", "accuracy": 90, "count": 25}'::jsonb, 50, 'rare', 'expertise');

-- Update function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard;
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for user data protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own category stats" ON category_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own daily stats" ON daily_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own AI sessions" ON ai_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own AI chats" ON ai_chats FOR ALL USING (auth.uid() = (SELECT user_id FROM ai_sessions WHERE id = session_id));

-- Allow public read access for leaderboard and badges
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

COMMIT;
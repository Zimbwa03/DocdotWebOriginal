
-- =====================================================
-- COMPLETE SUPABASE SCHEMA FOR DOCDOT MEDICAL PLATFORM
-- =====================================================
-- This schema drops all existing tables and recreates them
-- to ensure perfect compatibility with the application

-- Drop all existing tables first (cascade to handle dependencies)
DROP TABLE IF EXISTS exam_generation_history CASCADE;
DROP TABLE IF EXISTS custom_exam_attempts CASCADE;
DROP TABLE IF EXISTS stem_options CASCADE;
DROP TABLE IF EXISTS custom_exam_stems CASCADE;
DROP TABLE IF EXISTS custom_exams CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS meeting_reminders CASCADE;
DROP TABLE IF EXISTS study_group_members CASCADE;
DROP TABLE IF EXISTS study_groups CASCADE;
DROP TABLE IF EXISTS study_planner_sessions CASCADE;
DROP TABLE IF EXISTS ai_chats CASCADE;
DROP TABLE IF EXISTS ai_sessions CASCADE;
DROP TABLE IF EXISTS global_leaderboard CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS category_stats CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- CORE USER SYSTEM
-- =====================================================

-- Users table - integrated with Supabase auth
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  specialization TEXT,
  institution TEXT,
  phone TEXT,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  learning_style TEXT, -- visual, auditory, kinesthetic
  goals JSONB DEFAULT '[]', -- Array of learning goals
  schedule JSONB DEFAULT '{}', -- Study schedule preferences
  subscription_tier TEXT NOT NULL DEFAULT 'free', -- free, starter, premium
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_study_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'starter', 'premium')),
  CONSTRAINT valid_learning_style CHECK (learning_style IS NULL OR learning_style IN ('visual', 'auditory', 'kinesthetic'))
);

-- User statistics and progress tracking
CREATE TABLE user_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0, -- percentage
  total_study_time INTEGER DEFAULT 0, -- minutes
  rank INTEGER DEFAULT 0,
  weekly_xp INTEGER DEFAULT 0,
  monthly_xp INTEGER DEFAULT 0,
  average_accuracy INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  total_badges INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTENT STRUCTURE
-- =====================================================

-- Medical categories and topics
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- e.g. "upperlimb", "thorax"
  description TEXT,
  type TEXT NOT NULL, -- gross_anatomy, histology, embryology
  content TEXT,
  access_tier TEXT NOT NULL DEFAULT 'free', -- free, starter, premium
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_access_tier CHECK (access_tier IN ('free', 'starter', 'premium'))
);

-- Quiz system
CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium', -- easy, medium, hard
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- User quiz attempts with comprehensive tracking
CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE SET NULL,
  question_identifier TEXT, -- For tracking questions from JSON files
  category TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent INTEGER, -- seconds
  difficulty TEXT,
  xp_earned INTEGER DEFAULT 0,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOM EXAM SYSTEM
-- =====================================================

-- Custom Exams Table (stores exam metadata)
CREATE TABLE custom_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL, -- 'anatomy', 'physiology'
  title TEXT NOT NULL,
  topics TEXT[] NOT NULL, -- Array of topic names like ['Upper Limb', 'Thorax']
  stem_count INTEGER NOT NULL DEFAULT 5,
  duration_seconds INTEGER NOT NULL DEFAULT 450, -- 7.5 minutes (90 seconds per stem)
  difficulty TEXT DEFAULT 'intermediate',
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}', -- Store additional exam settings
  
  -- Constraints
  CONSTRAINT valid_exam_type CHECK (exam_type IN ('anatomy', 'physiology')),
  CONSTRAINT valid_stem_count CHECK (stem_count >= 5 AND stem_count <= 50),
  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'archived'))
);

-- Custom Exam Stems (stores individual question stems)
CREATE TABLE custom_exam_stems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_exam_id UUID NOT NULL REFERENCES custom_exams(id) ON DELETE CASCADE,
  stem_text TEXT NOT NULL, -- "Concerning the bones of the upper limb"
  order_index INTEGER NOT NULL,
  topic TEXT, -- Specific topic this stem covers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_stem_order UNIQUE (custom_exam_id, order_index),
  CONSTRAINT valid_order_index CHECK (order_index > 0)
);

-- Stem Options (stores True/False options for each stem)
CREATE TABLE stem_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stem_id UUID NOT NULL REFERENCES custom_exam_stems(id) ON DELETE CASCADE,
  option_letter CHAR(1) NOT NULL, -- 'A' or 'B'
  statement TEXT NOT NULL, -- "The clavicle is the most commonly fractured bone"
  is_correct BOOLEAN NOT NULL,
  explanation TEXT, -- Medical explanation for the answer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_option_letter CHECK (option_letter IN ('A', 'B')),
  CONSTRAINT unique_option_per_stem UNIQUE (stem_id, option_letter)
);

-- Custom Exam Attempts (tracks user performance on custom exams)
CREATE TABLE custom_exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_exam_id UUID NOT NULL REFERENCES custom_exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  total_stems INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  score_percentage DECIMAL(5,2),
  answers JSONB DEFAULT '{}', -- Store user answers: {"stem_1": {"selected": "A", "correct": true}, ...}
  xp_earned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  
  -- Constraints
  CONSTRAINT valid_attempt_status CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  CONSTRAINT valid_score CHECK (score_percentage >= 0 AND score_percentage <= 100)
);

-- Exam Generation History (tracks AI generation requests)
CREATE TABLE exam_generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL,
  topics TEXT[] NOT NULL,
  requested_stem_count INTEGER NOT NULL,
  actual_stem_count INTEGER,
  generation_status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
  ai_provider TEXT DEFAULT 'deepseek',
  generation_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  custom_exam_id UUID REFERENCES custom_exams(id) ON DELETE SET NULL
);

-- =====================================================
-- ANALYTICS AND TRACKING
-- =====================================================

-- Category-specific performance tracking
CREATE TABLE category_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0, -- percentage
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily study statistics
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  category TEXT,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  study_time INTEGER DEFAULT 0, -- minutes
  topics_studied JSONB DEFAULT '[]', -- Array of topic names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Global leaderboard table
CREATE TABLE global_leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  rank INTEGER NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard system
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  rank INTEGER NOT NULL,
  xp INTEGER NOT NULL,
  level INTEGER NOT NULL,
  streak INTEGER NOT NULL,
  full_name TEXT,
  institution TEXT,
  category TEXT,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BADGE AND ACHIEVEMENT SYSTEM
-- =====================================================

-- Badge and achievement system
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- achievement, streak, xp, quiz
  tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
  requirement INTEGER NOT NULL, -- numeric requirement
  requirement_type TEXT NOT NULL, -- questions, accuracy, streak, xp
  xp_reward INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  CONSTRAINT valid_requirement_type CHECK (requirement_type IN ('questions', 'accuracy', 'streak', 'xp', 'time', 'perfect'))
);

CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0, -- Current progress towards earning
  requirement INTEGER, -- Cached requirement value
  xp_reward INTEGER DEFAULT 0, -- Cached XP reward
  name TEXT, -- Cached badge name
  description TEXT, -- Cached badge description
  
  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- AI TUTORING SYSTEM
-- =====================================================

-- AI tutoring system
CREATE TABLE ai_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- tutor, quiz_explanation, study_help
  title TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_messages INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE ai_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES ai_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- STUDY TOOLS
-- =====================================================

-- Study planner sessions
CREATE TABLE study_planner_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER DEFAULT 60, -- minutes
  notes TEXT,
  status TEXT DEFAULT 'planned', -- planned, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_session_status CHECK (status IN ('planned', 'completed', 'cancelled'))
);

-- Study groups and collaboration
CREATE TABLE study_groups (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meeting_link TEXT,
  meeting_type TEXT, -- 'zoom', 'meet'
  scheduled_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 60, -- minutes
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 1,
  category TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_meeting_type CHECK (meeting_type IS NULL OR meeting_type IN ('zoom', 'meet'))
);

CREATE TABLE study_group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  has_joined_meeting BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  
  UNIQUE(group_id, user_id)
);

CREATE TABLE meeting_reminders (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User and stats indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_total_xp ON user_stats(total_xp DESC);

-- Quiz system indexes
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_attempted_at ON quiz_attempts(attempted_at DESC);
CREATE INDEX idx_quiz_attempts_category ON quiz_attempts(category);
CREATE INDEX idx_quizzes_topic_id ON quizzes(topic_id);

-- Custom exam indexes
CREATE INDEX idx_custom_exams_user_id ON custom_exams(user_id);
CREATE INDEX idx_custom_exams_type_status ON custom_exams(exam_type, status);
CREATE INDEX idx_custom_exam_stems_exam_id ON custom_exam_stems(custom_exam_id);
CREATE INDEX idx_custom_exam_stems_order ON custom_exam_stems(custom_exam_id, order_index);
CREATE INDEX idx_stem_options_stem_id ON stem_options(stem_id);
CREATE INDEX idx_custom_exam_attempts_user_id ON custom_exam_attempts(user_id);
CREATE INDEX idx_custom_exam_attempts_exam_id ON custom_exam_attempts(custom_exam_id);
CREATE INDEX idx_generation_history_user_id ON exam_generation_history(user_id);

-- Analytics indexes
CREATE INDEX idx_category_stats_user_id ON category_stats(user_id);
CREATE INDEX idx_daily_stats_user_id_date ON daily_stats(user_id, date);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_global_leaderboard_rank ON global_leaderboard(rank);

-- Badge system indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- AI system indexes
CREATE INDEX idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX idx_ai_chats_session_id ON ai_chats(session_id);

-- Study tools indexes
CREATE INDEX idx_study_groups_scheduled_time ON study_groups(scheduled_time);
CREATE INDEX idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX idx_study_planner_sessions_user_id ON study_planner_sessions(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exam_stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_planner_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_reminders ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- User stats policy
CREATE POLICY "Users can view own stats" ON user_stats
    FOR ALL USING (auth.uid() = user_id);

-- Quiz attempts policy
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

-- Category stats policy
CREATE POLICY "Users can view own category stats" ON category_stats
    FOR ALL USING (auth.uid() = user_id);

-- Daily stats policy
CREATE POLICY "Users can view own daily stats" ON daily_stats
    FOR ALL USING (auth.uid() = user_id);

-- Custom exam policies
CREATE POLICY "Users can manage their own custom exams" ON custom_exams
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view stems of their exams" ON custom_exam_stems
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM custom_exams 
            WHERE custom_exams.id = custom_exam_stems.custom_exam_id 
            AND custom_exams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view options of their exam stems" ON stem_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM custom_exam_stems 
            JOIN custom_exams ON custom_exams.id = custom_exam_stems.custom_exam_id
            WHERE custom_exam_stems.id = stem_options.stem_id 
            AND custom_exams.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own exam attempts" ON custom_exam_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own generation history" ON exam_generation_history
    FOR ALL USING (auth.uid() = user_id);

-- Badge policies
CREATE POLICY "Users can view own badges" ON user_badges
    FOR ALL USING (auth.uid() = user_id);

-- AI policies
CREATE POLICY "Users can manage own AI sessions" ON ai_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI chats" ON ai_chats
    FOR ALL USING (auth.uid() = user_id);

-- Study tools policies
CREATE POLICY "Users can manage own study sessions" ON study_planner_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public study groups" ON study_groups
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own study groups" ON study_groups
    FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Users can manage own group memberships" ON study_group_members
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meeting reminders" ON meeting_reminders
    FOR ALL USING (auth.uid() = user_id);

-- Public policies for reference data
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public can read quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Public can read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Public can read leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Public can read global leaderboard" ON global_leaderboard FOR SELECT USING (true);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_exams_updated_at BEFORE UPDATE ON custom_exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_planner_sessions_updated_at BEFORE UPDATE ON study_planner_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
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

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert medical categories
INSERT INTO categories (name, description, icon, order_index) VALUES
('Anatomy', 'Human body structure and organization', 'User', 1),
('Physiology', 'Body functions and processes', 'Activity', 2),
('Pathology', 'Disease processes and mechanisms', 'AlertTriangle', 3),
('Pharmacology', 'Drug actions and interactions', 'Pill', 4),
('Microbiology', 'Microorganisms and infections', 'Bug', 5),
('Biochemistry', 'Chemical processes in living organisms', 'Atom', 6);

-- Insert sample badges
INSERT INTO badges (name, description, icon, category, tier, requirement, requirement_type, xp_reward, color) VALUES
('First Steps', 'Complete your first quiz', 'Trophy', 'performance', 'bronze', 1, 'questions', 50, '#CD7F32'),
('Quick Learner', 'Answer 10 questions correctly', 'Zap', 'performance', 'bronze', 10, 'questions', 100, '#CD7F32'),
('Streak Master', 'Maintain a 7-day study streak', 'Flame', 'streak', 'silver', 7, 'streak', 200, '#C0C0C0'),
('Accuracy Expert', 'Achieve 90% accuracy in 50+ questions', 'Target', 'accuracy', 'gold', 90, 'accuracy', 500, '#FFD700'),
('Study Marathon', 'Study for 10 hours total', 'Clock', 'time', 'silver', 600, 'time', 300, '#C0C0C0'),
('Knowledge Seeker', 'Earn 1000 XP', 'Star', 'xp', 'gold', 1000, 'xp', 1000, '#FFD700');

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get complete exam data
CREATE OR REPLACE FUNCTION get_custom_exam_complete(exam_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'exam', to_jsonb(ce.*),
    'stems', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', ces.id,
          'stemText', ces.stem_text,
          'orderIndex', ces.order_index,
          'topic', ces.topic,
          'options', stem_options_array.options
        ) ORDER BY ces.order_index
      ), '[]'::jsonb
    )
  ) INTO result
  FROM custom_exams ce
  LEFT JOIN custom_exam_stems ces ON ce.id = ces.custom_exam_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', so.id,
        'optionLetter', so.option_letter,
        'statement', so.statement,
        'answer', so.is_correct,
        'explanation', so.explanation
      ) ORDER BY so.option_letter
    ) as options
    FROM stem_options so
    WHERE so.stem_id = ces.id
  ) stem_options_array ON true
  WHERE ce.id = exam_id
    AND ce.user_id = auth.uid()
  GROUP BY ce.id, ce.user_id, ce.exam_type, ce.title, ce.topics, ce.stem_count, 
           ce.duration_seconds, ce.difficulty, ce.status, ce.ai_generated, 
           ce.created_at, ce.updated_at, ce.metadata;

  RETURN result;
END;
$$;

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION update_global_leaderboard()
RETURNS void AS $$
BEGIN
    -- Update global leaderboard with current user stats
    INSERT INTO global_leaderboard (user_id, total_xp, current_level, rank, first_name, last_name, email)
    SELECT 
        us.user_id,
        us.total_xp,
        us.current_level,
        ROW_NUMBER() OVER (ORDER BY us.total_xp DESC, us.current_level DESC) as rank,
        u.first_name,
        u.last_name,
        u.email
    FROM user_stats us
    JOIN users u ON us.user_id = u.id
    WHERE us.total_xp > 0
    ON CONFLICT (user_id) DO UPDATE SET
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        rank = EXCLUDED.rank,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Add schema version comment
COMMENT ON SCHEMA public IS 'DocDot Medical Education Platform - Complete Schema v2.0 - Fully integrated with Supabase Auth and optimized for medical education features';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Final success message
SELECT 'DocDot Supabase schema created successfully! All tables, indexes, RLS policies, and sample data have been set up.' as status;

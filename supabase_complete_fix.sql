-- Complete fix for all missing columns and authentication integration

-- Add ALL missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Add missing columns to user_stats table  
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Update existing data
UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, '') WHERE full_name IS NULL;
UPDATE user_stats SET level = current_level WHERE level IS NULL;

-- Enable Row Level Security (RLS) for proper Supabase Auth integration
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (integrates with Supabase Auth)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quiz attempts" ON quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own category stats" ON category_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily stats" ON daily_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own AI sessions" ON ai_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own AI chats" ON ai_chats FOR ALL USING (auth.uid() = (SELECT user_id FROM ai_sessions WHERE id = session_id));

-- Allow public read access for leaderboard and badges
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Anyone can view global leaderboard" ON global_leaderboard FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Users can view own user badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- Create function to automatically create user_stats when a user is created
CREATE OR REPLACE FUNCTION create_user_stats_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id, total_questions, correct_answers, total_xp, current_level, level)
    VALUES (NEW.id, 0, 0, 0, 1, 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create user_stats for new users
DROP TRIGGER IF EXISTS trigger_create_user_stats ON users;
CREATE TRIGGER trigger_create_user_stats
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_stats_for_new_user();
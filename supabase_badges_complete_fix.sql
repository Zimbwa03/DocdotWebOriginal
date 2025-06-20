
-- Complete fix for badges table structure
-- This will ensure the badges table has all required columns

-- Drop existing badges table if it exists to start fresh
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;

-- Create badges table with all required columns
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  requirement INTEGER NOT NULL,
  requirement_type TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#CD7F32',
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_id INTEGER REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  requirement INTEGER,
  xp_reward INTEGER DEFAULT 0,
  name TEXT,
  description TEXT,
  UNIQUE(user_id, badge_id)
);

-- Insert default badges with correct structure
INSERT INTO badges (name, description, icon, category, tier, requirement, requirement_type, xp_reward, color) VALUES
('First Steps', 'Complete your first quiz', 'Trophy', 'performance', 'bronze', 1, 'questions', 50, '#CD7F32'),
('Quick Learner', 'Answer 10 questions correctly', 'Zap', 'performance', 'bronze', 10, 'questions', 100, '#CD7F32'),
('Streak Master', 'Maintain a 7-day study streak', 'Flame', 'streak', 'silver', 7, 'streak', 200, '#C0C0C0'),
('Accuracy Expert', 'Achieve 90% accuracy in 50+ questions', 'Target', 'mastery', 'gold', 90, 'accuracy', 500, '#FFD700'),
('Study Marathon', 'Study for 10 hours total', 'Clock', 'time', 'silver', 600, 'time', 300, '#C0C0C0'),
('Knowledge Seeker', 'Earn 1000 XP', 'Star', 'performance', 'gold', 1000, 'xp', 1000, '#FFD700');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Users can view own badges" ON user_badges FOR ALL USING (auth.uid() = user_id);

COMMENT ON TABLE badges IS 'Achievement badges that users can earn';
COMMENT ON TABLE user_badges IS 'Badges earned by users';

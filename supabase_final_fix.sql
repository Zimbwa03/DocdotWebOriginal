-- Final comprehensive fix for all remaining schema issues

-- Drop and recreate global_leaderboard table with correct structure
DROP TABLE IF EXISTS global_leaderboard CASCADE;
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

-- Add missing column to user_stats table
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS average_accuracy INTEGER DEFAULT 0;

-- Add missing column to daily_stats table if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_stats' AND column_name = 'category') THEN
    ALTER TABLE daily_stats ADD COLUMN category TEXT;
  END IF;
END $$;

-- Ensure badges table exists with correct structure
CREATE TABLE IF NOT EXISTS badges (
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
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_id INTEGER REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default badges if they don't exist
INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'First Quiz', 'Complete your first quiz', '🎯', '{"type": "quiz_count", "value": 1}', 10, 'common', 'achievement'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'First Quiz');

INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'Quiz Master', 'Complete 100 quizzes', '🏆', '{"type": "quiz_count", "value": 100}', 100, 'legendary', 'achievement'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Quiz Master');

INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'Streak Keeper', 'Maintain a 7-day study streak', '🔥', '{"type": "streak", "value": 7}', 50, 'rare', 'streak'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Streak Keeper');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_leaderboard_total_xp ON global_leaderboard(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_global_leaderboard_user_id ON global_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_category ON daily_stats(category);

-- Enable RLS on new tables
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view global leaderboard" ON global_leaderboard FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
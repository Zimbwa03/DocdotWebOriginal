-- Additional fixes for remaining schema issues

-- Add missing column to user_stats table
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS average_accuracy INTEGER DEFAULT 0;

-- Add missing column to daily_stats table
ALTER TABLE daily_stats ADD COLUMN IF NOT EXISTS category TEXT;

-- Create badges table if it doesn't exist
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

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'First Quiz', 'Complete your first quiz', '🎯', '{"type": "quiz_count", "value": 1}', 10, 'common', 'achievement'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'First Quiz');

INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'Quiz Master', 'Complete 100 quizzes', '🏆', '{"type": "quiz_count", "value": 100}', 100, 'legendary', 'achievement'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Quiz Master');

INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'Streak Keeper', 'Maintain a 7-day study streak', '🔥', '{"type": "streak", "value": 7}', 50, 'rare', 'streak'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Streak Keeper');

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_id INTEGER REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Fix badges table structure and add missing columns

-- Add missing columns to badges table
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS requirement JSONB;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing column to user_stats table
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS average_accuracy INTEGER DEFAULT 0;

-- Insert default badges with correct column structure
INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'First Quiz', 'Complete your first quiz', '🎯', '{"type": "quiz_count", "value": 1}'::jsonb, 10, 'common', 'achievement'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'First Quiz');

INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'Quiz Master', 'Complete 100 quizzes', '🏆', '{"type": "quiz_count", "value": 100}'::jsonb, 100, 'legendary', 'achievement'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Quiz Master');

INSERT INTO badges (name, description, icon, requirement, xp_reward, rarity, category)
SELECT 'Streak Keeper', 'Maintain a 7-day study streak', '🔥', '{"type": "streak", "value": 7}'::jsonb, 50, 'rare', 'streak'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Streak Keeper');
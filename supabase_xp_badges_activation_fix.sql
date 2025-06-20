
-- COMPLETE XP POINTS AND BADGES SYSTEM ACTIVATION FIX
-- Run this in Supabase SQL Editor to fully activate the system

-- 1. Fix global_leaderboard table structure
DROP TABLE IF EXISTS global_leaderboard CASCADE;
CREATE TABLE global_leaderboard (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  rank INTEGER DEFAULT 0,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Fix leaderboard table to include missing columns
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS accuracy INTEGER DEFAULT 0;
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- Drop existing columns that might conflict
ALTER TABLE leaderboard DROP COLUMN IF EXISTS xp;
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- 3. Ensure user_stats has all required columns with proper types
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS monthly_xp INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS total_badges INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS average_accuracy INTEGER DEFAULT 0;

-- Update existing user_stats to ensure consistency
UPDATE user_stats SET 
  level = COALESCE(current_level, 1),
  streak = COALESCE(current_streak, 0),
  average_accuracy = COALESCE(average_score, 0),
  weekly_xp = COALESCE(weekly_xp, 0),
  monthly_xp = COALESCE(monthly_xp, 0),
  total_badges = COALESCE(total_badges, 0)
WHERE level IS NULL OR streak IS NULL OR average_accuracy IS NULL;

-- 4. Create or replace the analytics calculation function
CREATE OR REPLACE FUNCTION recalculate_user_analytics(target_user_id TEXT)
RETURNS VOID AS $$
DECLARE
    calc_total_questions INTEGER;
    calc_correct_answers INTEGER;
    calc_total_xp INTEGER;
    calc_current_level INTEGER;
    calc_average_score INTEGER;
    calc_total_study_time INTEGER;
    calc_streak INTEGER;
    calc_longest_streak INTEGER;
BEGIN
    -- Calculate stats from quiz_attempts
    SELECT 
        COUNT(*),
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
        SUM(COALESCE(xp_earned, 0)),
        SUM(COALESCE(time_spent, 0))
    INTO 
        calc_total_questions,
        calc_correct_answers, 
        calc_total_xp,
        calc_total_study_time
    FROM quiz_attempts 
    WHERE user_id = target_user_id;
    
    -- Handle case where user has no quiz attempts
    IF calc_total_questions IS NULL THEN
        calc_total_questions := 0;
        calc_correct_answers := 0;
        calc_total_xp := 0;
        calc_total_study_time := 0;
    END IF;
    
    -- Calculate derived values
    calc_current_level := GREATEST(1, (calc_total_xp / 1000) + 1);
    calc_average_score := CASE 
        WHEN calc_total_questions > 0 THEN (calc_correct_answers * 100 / calc_total_questions)
        ELSE 0 
    END;
    
    -- Calculate streaks (simplified version)
    calc_streak := 0;
    calc_longest_streak := 0;
    
    -- Update or insert user_stats
    INSERT INTO user_stats (
        user_id, total_questions, correct_answers, total_xp, 
        current_level, level, current_streak, streak, longest_streak,
        average_score, average_accuracy, total_study_time, rank,
        weekly_xp, monthly_xp, total_badges, updated_at
    ) VALUES (
        target_user_id, calc_total_questions, calc_correct_answers, calc_total_xp,
        calc_current_level, calc_current_level, calc_streak, calc_streak, calc_longest_streak,
        calc_average_score, calc_average_score, GREATEST(0, calc_total_study_time / 60), 0,
        0, 0, 0, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_questions = EXCLUDED.total_questions,
        correct_answers = EXCLUDED.correct_answers,
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        level = EXCLUDED.level,
        current_streak = EXCLUDED.current_streak,
        streak = EXCLUDED.streak,
        longest_streak = EXCLUDED.longest_streak,
        average_score = EXCLUDED.average_score,
        average_accuracy = EXCLUDED.average_accuracy,
        total_study_time = EXCLUDED.total_study_time,
        weekly_xp = EXCLUDED.weekly_xp,
        monthly_xp = EXCLUDED.monthly_xp,
        updated_at = NOW();
        
    RAISE NOTICE 'Updated stats for user %: % questions, % XP, Level %', 
        target_user_id, calc_total_questions, calc_total_xp, calc_current_level;
END;
$$ LANGUAGE plpgsql;

-- 5. Create badges table with proper structure if it doesn't exist
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT DEFAULT 'bronze',
  requirement INTEGER NOT NULL,
  requirement_type TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  color TEXT DEFAULT '#CD7F32',
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create user_badges table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  badge_id INTEGER REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  requirement INTEGER,
  xp_reward INTEGER DEFAULT 0,
  name TEXT,
  description TEXT,
  UNIQUE(user_id, badge_id)
);

-- 7. Insert comprehensive set of badges
INSERT INTO badges (name, description, icon, category, tier, requirement, requirement_type, xp_reward, color) VALUES
('First Steps', 'Complete your first quiz question', 'Trophy', 'performance', 'bronze', 1, 'questions', 50, '#CD7F32'),
('Quick Learner', 'Answer 5 questions correctly', 'Zap', 'performance', 'bronze', 5, 'correct', 100, '#CD7F32'),
('Getting Started', 'Answer 10 questions', 'BookOpen', 'performance', 'bronze', 10, 'questions', 150, '#CD7F32'),
('Steady Progress', 'Answer 25 questions', 'TrendingUp', 'performance', 'silver', 25, 'questions', 250, '#C0C0C0'),
('Quiz Enthusiast', 'Answer 50 questions', 'Star', 'performance', 'silver', 50, 'questions', 500, '#C0C0C0'),
('Question Master', 'Answer 100 questions', 'Crown', 'performance', 'gold', 100, 'questions', 1000, '#FFD700'),
('Accuracy Novice', 'Achieve 60% accuracy', 'Target', 'mastery', 'bronze', 60, 'accuracy', 200, '#CD7F32'),
('Accuracy Expert', 'Achieve 80% accuracy', 'Bullseye', 'mastery', 'silver', 80, 'accuracy', 400, '#C0C0C0'),
('Perfectionist', 'Achieve 90% accuracy', 'Award', 'mastery', 'gold', 90, 'accuracy', 800, '#FFD700'),
('XP Collector', 'Earn 100 XP', 'Coins', 'progression', 'bronze', 100, 'xp', 100, '#CD7F32'),
('XP Hunter', 'Earn 500 XP', 'DollarSign', 'progression', 'silver', 500, 'xp', 200, '#C0C0C0'),
('XP Master', 'Earn 1000 XP', 'TrendingUp', 'progression', 'gold', 1000, 'xp', 500, '#FFD700'),
('Level Up', 'Reach Level 2', 'ArrowUp', 'level', 'bronze', 2, 'level', 200, '#CD7F32'),
('Rising Star', 'Reach Level 5', 'Star', 'level', 'silver', 5, 'level', 500, '#C0C0C0'),
('Elite Student', 'Reach Level 10', 'Crown', 'level', 'gold', 10, 'level', 1000, '#FFD700')
ON CONFLICT (name) DO NOTHING;

-- 8. Create function to check and award badges automatically
CREATE OR REPLACE FUNCTION check_and_award_badges(target_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    badge_record RECORD;
    user_stats_record RECORD;
    badges_awarded INTEGER := 0;
    current_progress INTEGER;
    should_award BOOLEAN;
BEGIN
    -- Get user stats
    SELECT * INTO user_stats_record 
    FROM user_stats 
    WHERE user_id = target_user_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'No user stats found for user %', target_user_id;
        RETURN 0;
    END IF;
    
    -- Check each badge
    FOR badge_record IN 
        SELECT b.* FROM badges b 
        WHERE b.id NOT IN (
            SELECT ub.badge_id FROM user_badges ub 
            WHERE ub.user_id = target_user_id
        )
    LOOP
        should_award := FALSE;
        current_progress := 0;
        
        -- Check badge requirements
        CASE badge_record.requirement_type
            WHEN 'questions' THEN
                current_progress := COALESCE(user_stats_record.total_questions, 0);
                should_award := current_progress >= badge_record.requirement;
            WHEN 'correct' THEN
                current_progress := COALESCE(user_stats_record.correct_answers, 0);
                should_award := current_progress >= badge_record.requirement;
            WHEN 'accuracy' THEN
                current_progress := COALESCE(user_stats_record.average_score, 0);
                should_award := current_progress >= badge_record.requirement AND user_stats_record.total_questions >= 5;
            WHEN 'xp' THEN
                current_progress := COALESCE(user_stats_record.total_xp, 0);
                should_award := current_progress >= badge_record.requirement;
            WHEN 'level' THEN
                current_progress := COALESCE(user_stats_record.current_level, 1);
                should_award := current_progress >= badge_record.requirement;
            ELSE
                should_award := FALSE;
        END CASE;
        
        -- Award badge if requirements met
        IF should_award THEN
            INSERT INTO user_badges (user_id, badge_id, progress, requirement, xp_reward, name, description)
            VALUES (target_user_id, badge_record.id, current_progress, badge_record.requirement, 
                   badge_record.xp_reward, badge_record.name, badge_record.description);
            
            -- Add XP reward to user stats
            UPDATE user_stats 
            SET total_xp = total_xp + badge_record.xp_reward,
                current_level = GREATEST(1, (total_xp + badge_record.xp_reward) / 1000 + 1),
                level = GREATEST(1, (total_xp + badge_record.xp_reward) / 1000 + 1),
                total_badges = total_badges + 1
            WHERE user_id = target_user_id;
            
            badges_awarded := badges_awarded + 1;
            
            RAISE NOTICE 'Awarded badge "%" to user % (XP reward: %)', 
                badge_record.name, target_user_id, badge_record.xp_reward;
        END IF;
    END LOOP;
    
    RETURN badges_awarded;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to update global leaderboard
CREATE OR REPLACE FUNCTION update_global_leaderboard()
RETURNS VOID AS $$
BEGIN
    -- Clear existing leaderboard
    DELETE FROM global_leaderboard;
    
    -- Insert updated leaderboard data
    INSERT INTO global_leaderboard (user_id, total_xp, current_level, rank, first_name, last_name, full_name, email)
    SELECT 
        us.user_id,
        COALESCE(us.total_xp, 0) as total_xp,
        COALESCE(us.current_level, 1) as current_level,
        ROW_NUMBER() OVER (ORDER BY COALESCE(us.total_xp, 0) DESC, COALESCE(us.average_score, 0) DESC) as rank,
        u.first_name,
        u.last_name,
        COALESCE(u.full_name, CONCAT(u.first_name, ' ', u.last_name)) as full_name,
        u.email
    FROM user_stats us
    LEFT JOIN users u ON us.user_id = u.id
    WHERE u.id IS NOT NULL AND COALESCE(us.total_xp, 0) > 0
    ORDER BY total_xp DESC
    LIMIT 100;
    
    RAISE NOTICE 'Global leaderboard updated with % entries', (SELECT COUNT(*) FROM global_leaderboard);
END;
$$ LANGUAGE plpgsql;

-- 10. Create comprehensive user initialization function
CREATE OR REPLACE FUNCTION initialize_user_complete(target_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
    badges_awarded INTEGER;
    result JSONB;
BEGIN
    -- Ensure user stats exist
    PERFORM recalculate_user_analytics(target_user_id);
    
    -- Check and award badges
    badges_awarded := check_and_award_badges(target_user_id);
    
    -- Update leaderboard
    PERFORM update_global_leaderboard();
    
    -- Return summary
    result := jsonb_build_object(
        'user_id', target_user_id,
        'badges_awarded', badges_awarded,
        'stats_updated', true,
        'leaderboard_updated', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_xp ON user_stats(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_global_leaderboard_rank ON global_leaderboard(rank);

-- 12. Enable RLS policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
CREATE POLICY "Users can view own badges" ON user_badges FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Anyone can view leaderboard" ON global_leaderboard;
CREATE POLICY "Anyone can view leaderboard" ON global_leaderboard FOR SELECT USING (true);

-- 13. Initialize system for existing users
DO $$
DECLARE
    user_record RECORD;
    badges_count INTEGER;
BEGIN
    RAISE NOTICE 'Initializing XP and badges system for all existing users...';
    
    FOR user_record IN SELECT id FROM users LOOP
        BEGIN
            -- Initialize each user
            PERFORM initialize_user_complete(user_record.id);
            RAISE NOTICE 'Initialized user: %', user_record.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error initializing user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;
    
    -- Final leaderboard update
    PERFORM update_global_leaderboard();
    
    RAISE NOTICE 'XP and badges system activation complete!';
END $$;

-- 14. Create trigger to automatically award badges on stats update
CREATE OR REPLACE FUNCTION auto_award_badges_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Award badges when user stats are updated
    PERFORM check_and_award_badges(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_award_badges ON user_stats;
CREATE TRIGGER trigger_auto_award_badges
    AFTER UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION auto_award_badges_trigger();

-- Success message
SELECT 'XP POINTS AND BADGES SYSTEM FULLY ACTIVATED! 🎉' as status,
       COUNT(*) as total_badges_available FROM badges;

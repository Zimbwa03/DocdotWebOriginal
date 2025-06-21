
-- Fix Custom Exam Schema Issues and Achievement Notifications Table
-- Run this in Supabase SQL Editor

-- 1. First, ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing achievement_notifications table if it has wrong type
DROP TABLE IF EXISTS achievement_notifications CASCADE;

-- 3. Create achievement_notifications table with proper UUID type
CREATE TABLE achievement_notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX idx_achievement_notifications_user_id ON achievement_notifications(user_id);
CREATE INDEX idx_achievement_notifications_is_read ON achievement_notifications(user_id, is_read);

-- 5. Enable RLS for achievement_notifications
ALTER TABLE achievement_notifications ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policy for achievement_notifications
CREATE POLICY "Users can view own notifications" ON achievement_notifications
    FOR ALL USING (auth.uid() = user_id);

-- 7. Fix exam_generation_history table - add missing columns
ALTER TABLE exam_generation_history 
ADD COLUMN IF NOT EXISTS requested_stem_count INTEGER DEFAULT 5;

-- 8. Ensure all custom exam tables have proper structure
ALTER TABLE custom_exams 
ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';

-- 9. Update the exam generation function to handle the new schema
CREATE OR REPLACE FUNCTION track_exam_generation(
    p_user_id UUID,
    p_exam_type TEXT,
    p_topics TEXT[],
    p_requested_stem_count INTEGER
) RETURNS TEXT AS $$
DECLARE
    generation_id TEXT;
BEGIN
    generation_id := gen_random_uuid()::TEXT;
    
    INSERT INTO exam_generation_history (
        id, user_id, exam_type, topics, requested_stem_count,
        generation_status, ai_provider, created_at
    ) VALUES (
        generation_id, p_user_id, p_exam_type, p_topics, p_requested_stem_count,
        'pending', 'deepseek', NOW()
    );
    
    RETURN generation_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Create comprehensive badge system with medical education achievements
INSERT INTO badges (name, description, icon, category, tier, requirement, requirement_type, xp_reward, color) VALUES
-- Learning Journey Badges (like Candy Crush levels)
('First Diagnosis', 'Complete your first medical quiz', 'Stethoscope', 'journey', 'bronze', 1, 'questions', 100, '#8B4513'),
('Anatomy Explorer', 'Answer 25 anatomy questions correctly', 'Eye', 'specialty', 'bronze', 25, 'category_correct', 200, '#FF6B6B'),
('Physiology Master', 'Answer 50 physiology questions correctly', 'Heart', 'specialty', 'silver', 50, 'category_correct', 350, '#4ECDC4'),
('Pathology Detective', 'Answer 30 pathology questions correctly', 'Search', 'specialty', 'silver', 30, 'category_correct', 300, '#45B7D1'),
('Pharmacology Wizard', 'Answer 40 pharmacology questions correctly', 'Pill', 'specialty', 'gold', 40, 'category_correct', 400, '#96CEB4'),

-- Streak & Consistency Badges
('Study Streak 3', 'Study for 3 consecutive days', 'Flame', 'consistency', 'bronze', 3, 'streak', 150, '#FF9500'),
('Study Streak 7', 'Study for 7 consecutive days', 'Fire', 'consistency', 'silver', 7, 'streak', 300, '#FF6B00'),
('Study Streak 14', 'Study for 14 consecutive days', 'Zap', 'consistency', 'gold', 14, 'streak', 500, '#FF4500'),
('Study Streak 30', 'Study for 30 consecutive days', 'Crown', 'consistency', 'platinum', 30, 'streak', 1000, '#FFD700'),

-- Accuracy & Mastery Badges
('Sharp Shooter', 'Achieve 80% accuracy in 20+ questions', 'Target', 'mastery', 'bronze', 80, 'accuracy', 250, '#32CD32'),
('Precision Expert', 'Achieve 85% accuracy in 50+ questions', 'Crosshair', 'mastery', 'silver', 85, 'accuracy', 400, '#228B22'),
('Perfect Diagnostician', 'Achieve 90% accuracy in 100+ questions', 'Award', 'mastery', 'gold', 90, 'accuracy', 750, '#FFD700'),
('Legendary Healer', 'Achieve 95% accuracy in 200+ questions', 'Trophy', 'mastery', 'platinum', 95, 'accuracy', 1500, '#FF6347'),

-- Speed & Challenge Badges
('Quick Learner', 'Answer 10 questions in under 5 minutes total', 'Clock', 'speed', 'bronze', 300, 'speed', 200, '#87CEEB'),
('Speed Demon', 'Answer 25 questions in under 10 minutes total', 'Zap', 'speed', 'silver', 600, 'speed', 350, '#4169E1'),
('Lightning Fast', 'Answer 50 questions in under 15 minutes total', 'Bolt', 'speed', 'gold', 900, 'speed', 500, '#0000FF'),

-- XP & Level Badges
('Rising Student', 'Reach 500 XP', 'TrendingUp', 'progression', 'bronze', 500, 'xp', 100, '#9370DB'),
('Dedicated Learner', 'Reach 1500 XP', 'Star', 'progression', 'silver', 1500, 'xp', 300, '#8A2BE2'),
('Medical Scholar', 'Reach 3000 XP', 'BookOpen', 'progression', 'gold', 3000, 'xp', 500, '#4B0082'),
('Future Doctor', 'Reach 5000 XP', 'GraduationCap', 'progression', 'platinum', 5000, 'xp', 1000, '#FF1493'),

-- Special Achievement Badges
('Night Owl', 'Study after 10 PM', 'Moon', 'special', 'bronze', 1, 'time_based', 150, '#191970'),
('Early Bird', 'Study before 7 AM', 'Sun', 'special', 'bronze', 1, 'time_based', 150, '#FFD700'),
('Weekend Warrior', 'Study on weekends', 'Calendar', 'special', 'silver', 2, 'weekend', 200, '#FF69B4'),
('Study Group Leader', 'Create and host a study group', 'Users', 'social', 'gold', 1, 'study_group', 400, '#32CD32'),

-- Milestone Badges
('Century Club', 'Answer 100 questions', 'Hundred', 'milestone', 'silver', 100, 'questions', 300, '#DAA520'),
('Double Century', 'Answer 200 questions', 'TwoHundred', 'milestone', 'gold', 200, 'questions', 500, '#B8860B'),
('Triple Century', 'Answer 300 questions', 'ThreeHundred', 'milestone', 'platinum', 300, 'questions', 750, '#CD853F'),

-- Knowledge Domain Badges
('Anatomy Expert', 'Complete 80% of anatomy topics', 'Brain', 'domain', 'gold', 80, 'topic_completion', 600, '#FF4500'),
('Physiology Expert', 'Complete 80% of physiology topics', 'Activity', 'domain', 'gold', 80, 'topic_completion', 600, '#00CED1'),
('Pathology Expert', 'Complete 80% of pathology topics', 'AlertTriangle', 'domain', 'gold', 80, 'topic_completion', 600, '#DC143C'),

-- Social & Collaboration Badges
('Team Player', 'Join 3 study groups', 'UserPlus', 'social', 'bronze', 3, 'groups_joined', 200, '#20B2AA'),
('Mentor', 'Help 5 students in study groups', 'Users', 'social', 'silver', 5, 'mentoring', 350, '#4682B4'),
('Community Leader', 'Host 5 successful study sessions', 'Crown', 'social', 'gold', 5, 'hosting', 500, '#DAA520')

ON CONFLICT (name) DO NOTHING;

-- 11. Create badge rarity system for UI
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common';

UPDATE badges SET rarity = 'common' WHERE tier = 'bronze';
UPDATE badges SET rarity = 'rare' WHERE tier = 'silver';  
UPDATE badges SET rarity = 'epic' WHERE tier = 'gold';
UPDATE badges SET rarity = 'legendary' WHERE tier = 'platinum';

-- 12. Create comprehensive user analytics and badge checking function
CREATE OR REPLACE FUNCTION initialize_user_complete(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_stats_record RECORD;
    new_badges_awarded INTEGER := 0;
    total_attempts INTEGER;
    correct_attempts INTEGER;
    total_xp INTEGER;
    user_level INTEGER;
    badge_record RECORD;
    should_award BOOLEAN;
BEGIN
    -- Ensure user_stats exists
    INSERT INTO user_stats (user_id) 
    VALUES (p_user_id) 
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Calculate actual stats from quiz attempts
    SELECT 
        COUNT(*) as total_questions,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
        SUM(COALESCE(xp_earned, 0)) as total_xp_earned,
        ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END)) as avg_score
    INTO total_attempts, correct_attempts, total_xp, user_level
    FROM quiz_attempts 
    WHERE user_id = p_user_id;
    
    -- Set defaults if no attempts
    total_attempts := COALESCE(total_attempts, 0);
    correct_attempts := COALESCE(correct_attempts, 0);
    total_xp := COALESCE(total_xp, 0);
    user_level := GREATEST(1, FLOOR(total_xp / 1000.0) + 1);
    
    -- Update user_stats with calculated values
    UPDATE user_stats 
    SET 
        total_questions = total_attempts,
        correct_answers = correct_attempts,
        total_xp = total_xp,
        current_level = user_level,
        level = user_level,
        average_score = CASE WHEN total_attempts > 0 THEN ROUND((correct_attempts::DECIMAL / total_attempts) * 100) ELSE 0 END,
        average_accuracy = CASE WHEN total_attempts > 0 THEN ROUND((correct_attempts::DECIMAL / total_attempts) * 100) ELSE 0 END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Check and award badges
    FOR badge_record IN 
        SELECT b.* FROM badges b 
        WHERE b.id NOT IN (SELECT badge_id FROM user_badges WHERE user_id = p_user_id)
    LOOP
        should_award := FALSE;
        
        CASE badge_record.requirement_type
            WHEN 'questions' THEN
                should_award := total_attempts >= badge_record.requirement;
            WHEN 'correct' THEN
                should_award := correct_attempts >= badge_record.requirement;
            WHEN 'xp' THEN
                should_award := total_xp >= badge_record.requirement;
            WHEN 'accuracy' THEN
                should_award := total_attempts >= 5 AND 
                              (correct_attempts::DECIMAL / GREATEST(total_attempts, 1)) * 100 >= badge_record.requirement;
            ELSE
                should_award := total_attempts >= badge_record.requirement;
        END CASE;
        
        IF should_award THEN
            -- Award the badge
            INSERT INTO user_badges (user_id, badge_id, progress, earned_at)
            VALUES (p_user_id, badge_record.id, badge_record.requirement, NOW());
            
            -- Create notification
            INSERT INTO achievement_notifications (user_id, badge_id, message, xp_earned)
            VALUES (p_user_id, badge_record.id, 
                   '🏆 Achievement Unlocked: ' || badge_record.name || '!', 
                   badge_record.xp_reward);
            
            -- Add XP reward
            UPDATE user_stats 
            SET total_xp = total_xp + badge_record.xp_reward,
                current_level = GREATEST(1, FLOOR((total_xp + badge_record.xp_reward) / 1000.0) + 1),
                level = GREATEST(1, FLOOR((total_xp + badge_record.xp_reward) / 1000.0) + 1)
            WHERE user_id = p_user_id;
            
            new_badges_awarded := new_badges_awarded + 1;
        END IF;
    END LOOP;
    
    -- Update total badges count
    UPDATE user_stats 
    SET total_badges = (SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id)
    WHERE user_id = p_user_id;
    
    RETURN json_build_object(
        'success', true,
        'badges_awarded', new_badges_awarded,
        'total_xp', total_xp,
        'level', user_level,
        'total_questions', total_attempts,
        'correct_answers', correct_attempts
    );
END;
$$ LANGUAGE plpgsql;

-- 13. Create global leaderboard update function
CREATE OR REPLACE FUNCTION update_global_leaderboard()
RETURNS VOID AS $$
BEGIN
    -- Clear existing leaderboard
    DELETE FROM global_leaderboard;
    
    -- Populate with ranked users
    INSERT INTO global_leaderboard (user_id, total_xp, current_level, rank, first_name, last_name, full_name, email)
    SELECT 
        us.user_id,
        us.total_xp,
        us.current_level,
        ROW_NUMBER() OVER (ORDER BY us.total_xp DESC, us.average_score DESC) as rank,
        u.first_name,
        u.last_name,
        u.full_name,
        u.email
    FROM user_stats us
    LEFT JOIN users u ON us.user_id = u.id
    WHERE u.id IS NOT NULL AND us.total_xp > 0
    ORDER BY us.total_xp DESC, us.average_score DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Custom Exam Schema Fixed, Achievement Notifications Created, and Enhanced Badge System Ready! 🎉' as status,
       COUNT(*) as total_badges_available FROM badges;

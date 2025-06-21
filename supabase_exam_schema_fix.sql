
-- Fix Custom Exam Schema Issues
-- Run this in Supabase SQL Editor

-- 1. Fix exam_generation_history table - add missing columns
ALTER TABLE exam_generation_history 
ADD COLUMN IF NOT EXISTS requested_stem_count INTEGER DEFAULT 5;

-- 2. Ensure all custom exam tables have proper structure
ALTER TABLE custom_exams 
ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';

-- 3. Update the exam generation function to handle the new schema
CREATE OR REPLACE FUNCTION track_exam_generation(
    p_user_id TEXT,
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

-- 4. Create enhanced badge system with medical education achievements
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

-- 5. Create badge rarity system for UI
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common';

UPDATE badges SET rarity = 'common' WHERE tier = 'bronze';
UPDATE badges SET rarity = 'rare' WHERE tier = 'silver';  
UPDATE badges SET rarity = 'epic' WHERE tier = 'gold';
UPDATE badges SET rarity = 'legendary' WHERE tier = 'platinum';

-- 6. Create achievement notification system
CREATE TABLE IF NOT EXISTS achievement_notifications (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    badge_id INTEGER REFERENCES badges(id),
    message TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success message
SELECT 'Custom Exam Schema Fixed and Enhanced Badge System Created! 🎉' as status,
       COUNT(*) as total_badges_available FROM badges;

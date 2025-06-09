eaderboard indexes
CREATE INDEX idx_global_leaderboard_rank ON public.global_leaderboard(rank);
CREATE INDEX idx_leaderboard_category_rank ON public.leaderboard(category, rank);

-- AI system indexes
CREATE INDEX idx_ai_sessions_user_id ON public.ai_sessions(user_id);
CREATE INDEX idx_ai_chats_session_id ON public.ai_chats(session_id);
CREATE INDEX idx_ai_usage_user_date ON public.ai_usage_tracking(user_id, date);

-- Study tools indexes
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX idx_flashcards_next_review ON public.flashcards(next_review);
CREATE INDEX idx_study_groups_scheduled_time ON public.study_groups(scheduled_time);
CREATE INDEX idx_study_group_members_user_id ON public.study_group_members(user_id);

-- Billing indexes
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_planner_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- User analytics policy
CREATE POLICY "Users can view own analytics" ON public.user_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Quiz attempts policy
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
    FOR ALL USING (auth.uid() = user_id);

-- User stats policy
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR ALL USING (auth.uid() = user_id);

-- Category stats policy
CREATE POLICY "Users can view own category stats" ON public.category_stats
    FOR ALL USING (auth.uid() = user_id);

-- Daily stats policy
CREATE POLICY "Users can view own daily stats" ON public.daily_stats
    FOR ALL USING (auth.uid() = user_id);

-- Leaderboard policies (users can view all, but only update their own)
CREATE POLICY "Users can view leaderboard" ON public.leaderboard
    FOR SELECT USING (true);

CREATE POLICY "Users can view global leaderboard" ON public.global_leaderboard
    FOR SELECT USING (true);

-- AI sessions policy
CREATE POLICY "Users can manage own AI sessions" ON public.ai_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI chats" ON public.ai_chats
    FOR ALL USING (auth.uid() = user_id);

-- Study tools policies
CREATE POLICY "Users can manage own flashcards" ON public.flashcards
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study plans" ON public.study_plans
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study sessions" ON public.study_planner_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Study groups policies
CREATE POLICY "Users can view public study groups" ON public.study_groups
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own study groups" ON public.study_groups
    FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Users can manage own group memberships" ON public.study_group_members
    FOR ALL USING (auth.uid() = user_id);

-- Billing policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment history" ON public.payment_history
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications policy
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update user's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at BEFORE UPDATE ON public.user_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_analytics (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate user rank
CREATE OR REPLACE FUNCTION public.update_user_ranks()
RETURNS void AS $$
BEGIN
    WITH ranked_users AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY total_xp DESC, current_level DESC) as new_rank
        FROM public.user_stats
    )
    UPDATE public.user_stats 
    SET rank = ranked_users.new_rank
    FROM ranked_users
    WHERE public.user_stats.user_id = ranked_users.user_id;
    
    -- Update global leaderboard
    INSERT INTO public.global_leaderboard (user_id, total_xp, current_level, rank)
    SELECT us.user_id, us.total_xp, us.current_level, us.rank
    FROM public.user_stats us
    ON CONFLICT (user_id) DO UPDATE SET
        total_xp = EXCLUDED.total_xp,
        current_level = EXCLUDED.current_level,
        rank = EXCLUDED.rank,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert subscription plans
INSERT INTO public.subscription_plans (name, display_name, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free', 0.00, 0.00, 
 '["Limited quizzes", "Basic progress stats", "View study notes", "Preview book library", "View topic videos"]'::jsonb,
 '{"quizzes_per_day": 5, "ai_sessions_per_month": 0, "flashcards_limit": 50}'::jsonb),
('starter', 'Starter', 9.99, 99.99,
 '["Unlimited quizzes", "Advanced analytics", "Book downloads", "Basic AI tutoring", "Study planner", "Concept mastery tracking"]'::jsonb,
 '{"quizzes_per_day": -1, "ai_sessions_per_month": 50, "flashcards_limit": 500}'::jsonb),
('premium', 'Premium', 19.99, 199.99,
 '["All Starter features", "Advanced AI tutoring", "AI flashcards & mnemonics", "Study groups", "Priority support", "Personalized learning paths"]'::jsonb,
 '{"quizzes_per_day": -1, "ai_sessions_per_month": -1, "flashcards_limit": -1}'::jsonb);

-- Insert medical categories
INSERT INTO public.categories (name, description, icon, order_index) VALUES
('Anatomy', 'Human body structure and organization', 'User', 1),
('Physiology', 'Body functions and processes', 'Activity', 2),
('Pathology', 'Disease processes and mechanisms', 'AlertTriangle', 3),
('Pharmacology', 'Drug actions and interactions', 'Pill', 4),
('Microbiology', 'Microorganisms and infections', 'Bug', 5),
('Biochemistry', 'Chemical processes in living organisms', 'Atom', 6);

-- Insert sample badges
INSERT INTO public.badges (name, description, icon, category, tier, requirement, requirement_type, xp_reward, color) VALUES
('First Steps', 'Complete your first quiz', 'Trophy', 'performance', 'bronze', 1, 'questions', 50, '#CD7F32'),
('Quick Learner', 'Answer 10 questions correctly', 'Zap', 'performance', 'bronze', 10, 'questions', 100, '#CD7F32'),
('Streak Master', 'Maintain a 7-day study streak', 'Flame', 'streak', 'silver', 7, 'streak', 200, '#C0C0C0'),
('Accuracy Expert', 'Achieve 90% accuracy in 50+ questions', 'Target', 'mastery', 'gold', 90, 'accuracy', 500, '#FFD700'),
('Study Marathon', 'Study for 10 hours total', 'Clock', 'time', 'silver', 600, 'time', 300, '#C0C0C0'),
('Knowledge Seeker', 'Earn 1000 XP', 'Star', 'performance', 'gold', 1000, 'xp', 1000, '#FFD700');

-- Insert app settings
INSERT INTO public.app_settings (key, value, description, is_public) VALUES
('app_version', '"1.0.0"', 'Current application version', true),
('maintenance_mode', 'false', 'Whether the app is in maintenance mode', true),
('max_daily_quizzes_free', '5', 'Maximum daily quizzes for free users', false),
('ai_token_limit_starter', '10000', 'Monthly AI token limit for starter plan', false),
('ai_token_limit_premium', '-1', 'Monthly AI token limit for premium plan (-1 = unlimited)', false);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Add a comment to track schema version
COMMENT ON SCHEMA public IS 'DocDot Medical Education Platform - Schema v1.0 - Complete database structure for medical education app with AI tutoring, billing, analytics, and collaboration features';

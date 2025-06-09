-- =====================================================
-- DOCDOT MEDICAL EDUCATION PLATFORM - SUPABASE SCHEMA
-- Complete database schema for medical education app
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE USER MANAGEMENT
-- =====================================================

-- Users table - extends Supabase auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    specialization TEXT,
    institution TEXT,
    phone TEXT,
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    learning_style TEXT, -- 'visual', 'auditory', 'kinesthetic', 'reading'
    goals JSONB, -- Array of learning goals
    schedule JSONB, -- Study schedule preferences
    subscription_tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'starter', 'premium'
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak INTEGER NOT NULL DEFAULT 0,
    last_study_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User analytics - comprehensive performance tracking
CREATE TABLE public.user_analytics (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    total_study_hours INTEGER NOT NULL DEFAULT 0,
    weekly_study_hours INTEGER NOT NULL DEFAULT 0,
    monthly_study_hours INTEGER NOT NULL DEFAULT 0,
    average_session_duration INTEGER NOT NULL DEFAULT 0, -- in minutes
    total_quizzes INTEGER NOT NULL DEFAULT 0,
    total_correct_answers INTEGER NOT NULL DEFAULT 0,
    overall_accuracy INTEGER NOT NULL DEFAULT 0, -- percentage
    weekly_quizzes INTEGER NOT NULL DEFAULT 0,
    monthly_quizzes INTEGER NOT NULL DEFAULT 0,
    strongest_category TEXT,
    weakest_category TEXT,
    improvement_rate INTEGER NOT NULL DEFAULT 0, -- percentage
    consistency_score INTEGER NOT NULL DEFAULT 0, -- 0-100
    study_streak INTEGER NOT NULL DEFAULT 0,
    longest_study_streak INTEGER NOT NULL DEFAULT 0,
    badges_earned INTEGER NOT NULL DEFAULT 0,
    rank_position INTEGER NOT NULL DEFAULT 0,
    total_xp_earned INTEGER NOT NULL DEFAULT 0,
    weekly_xp_earned INTEGER NOT NULL DEFAULT 0,
    monthly_xp_earned INTEGER NOT NULL DEFAULT 0,
    last_active_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BILLING & SUBSCRIPTION SYSTEM
-- =====================================================

-- Subscription plans
CREATE TABLE public.subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    features JSONB NOT NULL, -- Array of features included
    limits JSONB NOT NULL, -- Usage limits (quizzes_per_day, etc.)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due'
    billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history
CREATE TABLE public.payment_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES public.user_subscriptions(id),
    stripe_payment_intent_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
    description TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student discounts and coupons
CREATE TABLE public.discount_codes (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- 'percentage', 'fixed_amount', 'student_discount'
    value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    applicable_plans JSONB, -- Array of plan IDs this applies to
    student_verification_required BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User discount usage tracking
CREATE TABLE public.user_discount_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    discount_code_id INTEGER REFERENCES public.discount_codes(id),
    subscription_id INTEGER REFERENCES public.user_subscriptions(id),
    amount_saved DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, discount_code_id)
);

-- =====================================================
-- MEDICAL CONTENT STRUCTURE
-- =====================================================

-- Medical categories (Anatomy, Physiology, etc.)
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    access_tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'starter', 'premium'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics within categories
CREATE TABLE public.topics (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'gross_anatomy', 'histology', 'embryology', 'physiology'
    content TEXT,
    access_tier TEXT NOT NULL DEFAULT 'free',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quizzes and questions
CREATE TABLE public.quizzes (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES public.topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of answer options
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    xp_reward INTEGER NOT NULL DEFAULT 10,
    access_tier TEXT NOT NULL DEFAULT 'free',
    image_url TEXT, -- For image-based questions
    reference_links JSONB, -- Array of reference materials
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- QUIZ SYSTEM & PERFORMANCE TRACKING
-- =====================================================

-- User quiz attempts with comprehensive tracking
CREATE TABLE public.quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_identifier TEXT, -- For tracking questions from external sources
    category TEXT NOT NULL,
    selected_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER, -- in seconds
    difficulty TEXT,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    study_session_id UUID, -- Groups questions answered in same session
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- User statistics and performance
CREATE TABLE public.user_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    average_score INTEGER NOT NULL DEFAULT 0, -- percentage
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    total_study_time INTEGER NOT NULL DEFAULT 0, -- in minutes
    rank INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category-specific performance
CREATE TABLE public.category_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    average_score INTEGER NOT NULL DEFAULT 0,
    average_time INTEGER NOT NULL DEFAULT 0, -- in seconds
    last_attempted TIMESTAMPTZ,
    mastery INTEGER NOT NULL DEFAULT 0, -- 0-100
    UNIQUE(user_id, category)
);

-- Daily performance tracking
CREATE TABLE public.daily_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    questions_answered INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    study_time INTEGER NOT NULL DEFAULT 0, -- in minutes
    xp_earned INTEGER NOT NULL DEFAULT 0,
    categories_studied JSONB, -- Array of categories
    UNIQUE(user_id, date)
);

-- =====================================================
-- LEADERBOARD SYSTEM
-- =====================================================

-- Global leaderboard
CREATE TABLE public.global_leaderboard (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    rank INTEGER NOT NULL DEFAULT 0,
    weekly_xp INTEGER NOT NULL DEFAULT 0,
    monthly_xp INTEGER NOT NULL DEFAULT 0,
    average_accuracy INTEGER NOT NULL DEFAULT 0,
    total_badges INTEGER NOT NULL DEFAULT 0,
    category TEXT, -- For category-specific leaderboards
    last_active TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category leaderboards
CREATE TABLE public.leaderboard (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT, -- null for overall leaderboard
    rank INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    accuracy INTEGER NOT NULL, -- percentage
    timeframe TEXT NOT NULL DEFAULT 'all_time', -- 'weekly', 'monthly', 'all_time'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACHIEVEMENT & BADGE SYSTEM
-- =====================================================

-- Badge definitions
CREATE TABLE public.badges (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- Lucide icon name
    category TEXT NOT NULL, -- 'performance', 'streak', 'mastery', 'time', 'special'
    tier TEXT NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum', 'diamond'
    requirement INTEGER NOT NULL, -- Numeric requirement value
    requirement_type TEXT NOT NULL, -- 'streak', 'questions', 'accuracy', 'time', 'xp'
    xp_reward INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL, -- Hex color for badge styling
    is_secret BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badge achievements
CREATE TABLE public.user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    progress INTEGER DEFAULT 0, -- Current progress towards badge
    UNIQUE(user_id, badge_id)
);

-- =====================================================
-- AI TUTORING SYSTEM
-- =====================================================

-- AI chat sessions
CREATE TABLE public.ai_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL, -- 'tutor', 'explain', 'questions', 'case_study', 'concept_map'
    title TEXT NOT NULL,
    last_message TEXT,
    context JSONB, -- Session context and metadata
    total_messages INTEGER NOT NULL DEFAULT 0,
    session_rating INTEGER, -- 1-5 user rating
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI chat messages
CREATE TABLE public.ai_chats (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    tool_type TEXT NOT NULL,
    context JSONB, -- Additional context data
    token_count INTEGER, -- For usage tracking
    response_time INTEGER, -- in milliseconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI usage tracking for billing
CREATE TABLE public.ai_usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost_cents INTEGER NOT NULL DEFAULT 0, -- Cost in cents
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STUDY TOOLS
-- =====================================================

-- Flashcards
CREATE TABLE public.flashcards (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES public.topics(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    mnemonic TEXT,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    study_count INTEGER NOT NULL DEFAULT 0,
    last_studied TIMESTAMPTZ,
    next_review TIMESTAMPTZ,
    ease_factor DECIMAL(3,2) NOT NULL DEFAULT 2.50, -- For spaced repetition
    interval_days INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study plans
CREATE TABLE public.study_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    topics JSONB NOT NULL, -- Array of topic IDs
    goals JSONB, -- Learning goals
    progress INTEGER NOT NULL DEFAULT 0, -- 0-100 percentage
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study planner sessions
CREATE TABLE public.study_planner_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'missed'
    notes TEXT,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STUDY GROUPS & COLLABORATION
-- =====================================================

-- Study groups
CREATE TABLE public.study_groups (
    id SERIAL PRIMARY KEY,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    meeting_link TEXT NOT NULL, -- Zoom or Google Meet link
    meeting_type TEXT NOT NULL, -- 'zoom' or 'meet'
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60, -- in minutes
    max_members INTEGER NOT NULL DEFAULT 10,
    current_members INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    category TEXT, -- study topic category
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    password TEXT, -- For private groups
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study group members
CREATE TABLE public.study_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'creator', 'moderator', 'member'
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    has_joined_meeting BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(group_id, user_id)
);

-- Meeting reminders
CREATE TABLE public.meeting_reminders (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reminder_time TIMESTAMPTZ NOT NULL,
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    sms_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- =====================================================
-- RESOURCE MANAGEMENT
-- =====================================================

-- Document library (books, notes, etc.)
CREATE TABLE public.documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_type TEXT NOT NULL, -- 'pdf', 'docx', 'pptx', 'video', 'audio'
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    category_id INTEGER REFERENCES public.categories(id),
    access_tier TEXT NOT NULL DEFAULT 'free',
    download_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User document access tracking
CREATE TABLE public.user_document_access (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES public.documents(id) ON DELETE CASCADE,
    access_type TEXT NOT NULL, -- 'view', 'download'
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADVANCED ANALYTICS
-- =====================================================

-- Learning pattern analysis
CREATE TABLE public.learning_patterns (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'time_preference', 'difficulty_progression', 'category_preference'
    pattern_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL, -- 0.00-1.00
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Performance predictions
CREATE TABLE public.performance_predictions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    predicted_score INTEGER NOT NULL, -- 0-100
    actual_score INTEGER,
    prediction_date TIMESTAMPTZ NOT NULL,
    accuracy DECIMAL(5,2), -- How accurate was the prediction
    model_version TEXT NOT NULL DEFAULT 'v1'
);

-- Study recommendations
CREATE TABLE public.study_recommendations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL, -- 'topic', 'difficulty', 'time', 'method'
    content JSONB NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0, -- 1-10 priority score
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    clicked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATION SYSTEM
-- =====================================================

-- User notifications
CREATE TABLE public.notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'study_reminder', 'achievement', 'group_invite', 'billing'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SYSTEM CONFIGURATION
-- =====================================================

-- App settings and feature flags
CREATE TABLE public.app_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User-related indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);

-- Quiz and performance indexes
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_category ON public.quiz_attempts(category);
CREATE INDEX idx_quiz_attempts_attempted_at ON public.quiz_attempts(attempted_at);
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_category_stats_user_category ON public.category_stats(user_id, category);
CREATE INDEX idx_daily_stats_user_date ON public.daily_stats(user_id, date);

-- Leaderboard indexes
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

-- Function to migrate existing auth users to public.users
CREATE OR REPLACE FUNCTION public.migrate_existing_auth_users()
RETURNS void AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at)
    SELECT 
        au.id,
        au.email,
        au.created_at,
        NOW()
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL
    ON CONFLICT (id) DO NOTHING;
    
    -- Initialize analytics for migrated users
    INSERT INTO public.user_analytics (user_id)
    SELECT u.id FROM public.users u
    LEFT JOIN public.user_analytics ua ON u.id = ua.user_id
    WHERE ua.user_id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Initialize stats for migrated users
    INSERT INTO public.user_stats (user_id)
    SELECT u.id FROM public.users u
    LEFT JOIN public.user_stats us ON u.id = us.user_id
    WHERE us.user_id IS NULL
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

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

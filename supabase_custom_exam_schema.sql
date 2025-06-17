-- Supabase SQL Schema for Custom Exam Generation Feature
-- This schema stores AI-generated medical exam questions and user custom exams

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS custom_exam_attempts CASCADE;
DROP TABLE IF EXISTS custom_exam_stems CASCADE;
DROP TABLE IF EXISTS custom_exams CASCADE;
DROP TABLE IF EXISTS stem_options CASCADE;

-- Custom Exams Table (stores exam metadata)
CREATE TABLE custom_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_type VARCHAR(50) NOT NULL, -- 'anatomy', 'physiology'
  title VARCHAR(255) NOT NULL,
  topics TEXT[] NOT NULL, -- Array of topic names like ['Upper Limb', 'Thorax']
  stem_count INTEGER NOT NULL DEFAULT 5,
  duration_seconds INTEGER NOT NULL DEFAULT 450, -- 7.5 minutes (90 seconds per stem)
  difficulty VARCHAR(20) DEFAULT 'intermediate',
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'archived'
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}', -- Store additional exam settings
  
  -- Constraints
  CONSTRAINT valid_exam_type CHECK (exam_type IN ('anatomy', 'physiology')),
  CONSTRAINT valid_stem_count CHECK (stem_count >= 5 AND stem_count <= 50),
  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'archived'))
);

-- Custom Exam Stems (stores individual question stems)
CREATE TABLE custom_exam_stems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_exam_id UUID NOT NULL REFERENCES custom_exams(id) ON DELETE CASCADE,
  stem_text TEXT NOT NULL, -- "Concerning the bones of the upper limb"
  order_index INTEGER NOT NULL,
  topic VARCHAR(100), -- Specific topic this stem covers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_stem_order UNIQUE (custom_exam_id, order_index),
  CONSTRAINT valid_order_index CHECK (order_index > 0)
);

-- Stem Options (stores True/False options for each stem)
CREATE TABLE stem_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stem_id UUID NOT NULL REFERENCES custom_exam_stems(id) ON DELETE CASCADE,
  option_letter CHAR(1) NOT NULL, -- 'A' or 'B'
  statement TEXT NOT NULL, -- "The clavicle is the most commonly fractured bone"
  is_correct BOOLEAN NOT NULL,
  explanation TEXT, -- Medical explanation for the answer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_option_letter CHECK (option_letter IN ('A', 'B')),
  CONSTRAINT unique_option_per_stem UNIQUE (stem_id, option_letter)
);

-- Custom Exam Attempts (tracks user performance on custom exams)
CREATE TABLE custom_exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_exam_id UUID NOT NULL REFERENCES custom_exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  total_stems INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  score_percentage DECIMAL(5,2),
  answers JSONB DEFAULT '{}', -- Store user answers: {"stem_1": {"selected": "A", "correct": true}, ...}
  xp_earned INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  
  -- Constraints
  CONSTRAINT valid_attempt_status CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  CONSTRAINT valid_score CHECK (score_percentage >= 0 AND score_percentage <= 100)
);

-- Exam Generation History (tracks AI generation requests)
CREATE TABLE exam_generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_type VARCHAR(50) NOT NULL,
  topics TEXT[] NOT NULL,
  requested_stem_count INTEGER NOT NULL,
  actual_stem_count INTEGER,
  generation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
  ai_provider VARCHAR(50) DEFAULT 'deepseek',
  generation_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  custom_exam_id UUID REFERENCES custom_exams(id)
);

-- Indexes for performance optimization
CREATE INDEX idx_custom_exams_user_id ON custom_exams(user_id);
CREATE INDEX idx_custom_exams_type_status ON custom_exams(exam_type, status);
CREATE INDEX idx_custom_exam_stems_exam_id ON custom_exam_stems(custom_exam_id);
CREATE INDEX idx_custom_exam_stems_order ON custom_exam_stems(custom_exam_id, order_index);
CREATE INDEX idx_stem_options_stem_id ON stem_options(stem_id);
CREATE INDEX idx_custom_exam_attempts_user_id ON custom_exam_attempts(user_id);
CREATE INDEX idx_custom_exam_attempts_exam_id ON custom_exam_attempts(custom_exam_id);
CREATE INDEX idx_custom_exam_attempts_completed ON custom_exam_attempts(completed_at);
CREATE INDEX idx_generation_history_user_id ON exam_generation_history(user_id);
CREATE INDEX idx_generation_history_status ON exam_generation_history(generation_status);

-- Row Level Security (RLS) Policies
ALTER TABLE custom_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exam_stems ENABLE ROW LEVEL SECURITY;
ALTER TABLE stem_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_generation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can manage their own custom exams" ON custom_exams
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view stems of their exams" ON custom_exam_stems
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_exams 
      WHERE custom_exams.id = custom_exam_stems.custom_exam_id 
      AND custom_exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view options of their exam stems" ON stem_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_exam_stems 
      JOIN custom_exams ON custom_exams.id = custom_exam_stems.custom_exam_id
      WHERE custom_exam_stems.id = stem_options.stem_id 
      AND custom_exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own exam attempts" ON custom_exam_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own generation history" ON exam_generation_history
  FOR ALL USING (auth.uid() = user_id);

-- Functions for common operations

-- Function to get exam with all stems and options
CREATE OR REPLACE FUNCTION get_custom_exam_complete(exam_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'exam', to_jsonb(ce.*),
    'stems', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', ces.id,
          'stemText', ces.stem_text,
          'orderIndex', ces.order_index,
          'topic', ces.topic,
          'options', stem_options_array.options
        ) ORDER BY ces.order_index
      ), '[]'::jsonb
    )
  ) INTO result
  FROM custom_exams ce
  LEFT JOIN custom_exam_stems ces ON ce.id = ces.custom_exam_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', so.id,
        'optionLetter', so.option_letter,
        'statement', so.statement,
        'answer', so.is_correct,
        'explanation', so.explanation
      ) ORDER BY so.option_letter
    ) as options
    FROM stem_options so
    WHERE so.stem_id = ces.id
  ) stem_options_array ON true
  WHERE ce.id = exam_id
    AND ce.user_id = auth.uid()
  GROUP BY ce.id, ce.user_id, ce.exam_type, ce.title, ce.topics, ce.stem_count, 
           ce.duration_seconds, ce.difficulty, ce.status, ce.ai_generated, 
           ce.created_at, ce.updated_at, ce.metadata;

  RETURN result;
END;
$$;

-- Function to calculate exam statistics
CREATE OR REPLACE FUNCTION get_user_custom_exam_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'totalExams', COUNT(DISTINCT ce.id),
    'completedExams', COUNT(DISTINCT CASE WHEN cea.status = 'completed' THEN cea.id END),
    'averageScore', ROUND(AVG(CASE WHEN cea.status = 'completed' THEN cea.score_percentage END), 2),
    'totalXpEarned', COALESCE(SUM(CASE WHEN cea.status = 'completed' THEN cea.xp_earned END), 0),
    'favoriteExamType', (
      SELECT exam_type 
      FROM custom_exams 
      WHERE user_id = user_uuid 
      GROUP BY exam_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    'recentExams', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', ce.id,
          'title', ce.title,
          'examType', ce.exam_type,
          'topics', ce.topics,
          'createdAt', ce.created_at,
          'lastAttempt', max_attempt.completed_at,
          'bestScore', max_attempt.score_percentage
        ) ORDER BY ce.created_at DESC
      )
      FROM custom_exams ce
      LEFT JOIN LATERAL (
        SELECT completed_at, score_percentage
        FROM custom_exam_attempts
        WHERE custom_exam_id = ce.id AND status = 'completed'
        ORDER BY score_percentage DESC, completed_at DESC
        LIMIT 1
      ) max_attempt ON true
      WHERE ce.user_id = user_uuid
      ORDER BY ce.created_at DESC
      LIMIT 5
    )
  ) INTO stats
  FROM custom_exams ce
  LEFT JOIN custom_exam_attempts cea ON ce.id = cea.custom_exam_id
  WHERE ce.user_id = user_uuid;

  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$;

-- Triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_exams_updated_at BEFORE UPDATE ON custom_exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion function (for testing)
CREATE OR REPLACE FUNCTION create_sample_custom_exam(
  user_uuid UUID,
  exam_title VARCHAR(255) DEFAULT 'Sample Anatomy Exam',
  exam_topics TEXT[] DEFAULT ARRAY['Upper Limb', 'Thorax']
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exam_id UUID;
  stem_id UUID;
BEGIN
  -- Create exam
  INSERT INTO custom_exams (user_id, exam_type, title, topics, stem_count)
  VALUES (user_uuid, 'anatomy', exam_title, exam_topics, 2)
  RETURNING id INTO exam_id;
  
  -- Create first stem
  INSERT INTO custom_exam_stems (custom_exam_id, stem_text, order_index, topic)
  VALUES (exam_id, 'Concerning the bones of the upper limb', 1, 'Upper Limb')
  RETURNING id INTO stem_id;
  
  -- Add options for first stem
  INSERT INTO stem_options (stem_id, option_letter, statement, is_correct, explanation)
  VALUES 
    (stem_id, 'A', 'The clavicle is the most commonly fractured bone', true, 'Clavicle fractures are very common in falls'),
    (stem_id, 'B', 'The radius is located medial to the ulna', false, 'Radius is lateral to ulna in anatomical position');
  
  -- Create second stem
  INSERT INTO custom_exam_stems (custom_exam_id, stem_text, order_index, topic)
  VALUES (exam_id, 'Concerning the muscles of the upper limb', 2, 'Upper Limb')
  RETURNING id INTO stem_id;
  
  -- Add options for second stem
  INSERT INTO stem_options (stem_id, option_letter, statement, is_correct, explanation)
  VALUES 
    (stem_id, 'A', 'The biceps brachii has two heads of origin', true, 'Long head and short head origins'),
    (stem_id, 'B', 'The triceps brachii has two heads', false, 'Triceps has three heads: long, lateral, medial');
    
  RETURN exam_id;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE custom_exams IS 'Stores metadata for AI-generated custom medical exams';
COMMENT ON TABLE custom_exam_stems IS 'Individual question stems within custom exams';
COMMENT ON TABLE stem_options IS 'True/False options for each exam stem';
COMMENT ON TABLE custom_exam_attempts IS 'User attempts and performance on custom exams';
COMMENT ON TABLE exam_generation_history IS 'Tracks AI generation requests and success/failure rates';

COMMENT ON FUNCTION get_custom_exam_complete(UUID) IS 'Retrieves complete exam data with stems and options';
COMMENT ON FUNCTION get_user_custom_exam_stats(UUID) IS 'Calculates comprehensive statistics for user custom exam performance';
COMMENT ON FUNCTION create_sample_custom_exam(UUID, VARCHAR, TEXT[]) IS 'Creates sample exam data for testing purposes';
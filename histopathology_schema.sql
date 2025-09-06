
-- Histopathology Topics and Subtopics Schema
-- This schema supports the AI-generated histopathology MCQ system

-- Create histopathology_topics table
CREATE TABLE IF NOT EXISTS histopathology_topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create histopathology_subtopics table
CREATE TABLE IF NOT EXISTS histopathology_subtopics (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES histopathology_topics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(topic_id, name)
);

-- Create histopathology_questions table for storing generated questions
CREATE TABLE IF NOT EXISTS histopathology_questions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES histopathology_topics(id) ON DELETE CASCADE,
    subtopic_id INTEGER REFERENCES histopathology_subtopics(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer BOOLEAN NOT NULL,
    explanation TEXT NOT NULL,
    ai_explanation TEXT,
    robbins_reference TEXT, -- Reference to Robbins Basic Pathology
    difficulty VARCHAR(20) DEFAULT 'medium',
    chapter_page VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create histopathology_question_attempts table for tracking user attempts
CREATE TABLE IF NOT EXISTS histopathology_question_attempts (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL, -- References users.id from main schema
    question_id INTEGER NOT NULL REFERENCES histopathology_questions(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES histopathology_topics(id),
    selected_answer BOOLEAN NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER, -- seconds
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT -- For grouping attempts in sessions
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_histopathology_subtopics_topic_id ON histopathology_subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_histopathology_questions_topic_id ON histopathology_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_histopathology_questions_subtopic_id ON histopathology_questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_histopathology_attempts_user_id ON histopathology_question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_histopathology_attempts_question_id ON histopathology_question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_histopathology_attempts_topic_id ON histopathology_question_attempts(topic_id);

-- Insert the 19 histopathology topics
INSERT INTO histopathology_topics (name, description) VALUES
('Cell Injury and Cell Death', 'Mechanisms of cellular injury, necrosis, and apoptosis'),
('Acute and Chronic Inflammation', 'Inflammatory responses and their pathological consequences'),
('Tissue Repair and Wound Healing', 'Processes of tissue regeneration and repair mechanisms'),
('Hemodynamic Disorders', 'Disorders of blood flow, thrombosis, and embolism'),
('Genetic Disorders', 'Inherited diseases and chromosomal abnormalities'),
('Diseases of Immunity', 'Autoimmune diseases, immunodeficiencies, and hypersensitivity'),
('Neoplasia', 'Tumor biology, benign and malignant neoplasms'),
('Infectious Diseases', 'Pathological changes caused by microorganisms'),
('Environmental and Nutritional Pathology', 'Disease caused by environmental factors and nutritional deficiencies'),
('Diseases of Infancy and Childhood', 'Pediatric pathological conditions and developmental disorders'),
('Blood Vessels', 'Vascular pathology including atherosclerosis and hypertension'),
('Heart', 'Cardiac pathology including ischemic heart disease and cardiomyopathies'),
('Hematopoietic and Lymphoid Systems', 'Blood disorders, leukemias, and lymphomas'),
('Respiratory System', 'Pulmonary pathology including pneumonia and lung cancer'),
('Gastrointestinal Tract', 'GI pathology including inflammatory bowel disease and GI cancers'),
('Liver, Biliary Tract, and Pancreas', 'Hepatobiliary and pancreatic pathology'),
('Kidney and Urinary System', 'Renal pathology including glomerular diseases and kidney tumors'),
('Male and Female Reproductive Systems', 'Reproductive system pathology and related cancers'),
('Endocrine System', 'Endocrine pathology including diabetes and thyroid disorders');

-- Insert sample subtopics for some major topics
INSERT INTO histopathology_subtopics (topic_id, name, description) VALUES
-- Cell Injury and Cell Death
(1, 'Cellular Adaptations', 'Hypertrophy, hyperplasia, atrophy, and metaplasia'),
(1, 'Cell Injury Mechanisms', 'Hypoxia, chemical toxicity, and physical agents'),
(1, 'Necrosis Types', 'Coagulative, liquefactive, caseous, and fat necrosis'),
(1, 'Apoptosis', 'Programmed cell death mechanisms and regulation'),

-- Acute and Chronic Inflammation
(2, 'Acute Inflammation', 'Vascular changes and cellular events in acute inflammation'),
(2, 'Chronic Inflammation', 'Characteristics and cellular components of chronic inflammation'),
(2, 'Inflammatory Mediators', 'Chemical mediators of inflammation'),
(2, 'Systemic Effects', 'Acute phase response and systemic inflammatory syndrome'),

-- Neoplasia
(7, 'Benign vs Malignant', 'Characteristics distinguishing benign from malignant tumors'),
(7, 'Carcinogenesis', 'Molecular basis of cancer development'),
(7, 'Tumor Spread', 'Local invasion and metastasis mechanisms'),
(7, 'Tumor Markers', 'Biomarkers used in cancer diagnosis and monitoring'),

-- Blood Vessels
(11, 'Atherosclerosis', 'Pathogenesis and complications of atherosclerosis'),
(11, 'Hypertension', 'Hypertensive vascular disease and end-organ damage'),
(11, 'Vasculitis', 'Inflammatory diseases of blood vessels'),
(11, 'Aneurysms', 'Types and complications of arterial aneurysms'),

-- Heart
(12, 'Ischemic Heart Disease', 'Myocardial infarction and angina pectoris'),
(12, 'Cardiomyopathies', 'Primary diseases of heart muscle'),
(12, 'Valvular Disease', 'Pathology of heart valves'),
(12, 'Congenital Heart Disease', 'Developmental abnormalities of the heart'),

-- Respiratory System
(14, 'Pneumonia', 'Infectious inflammation of the lungs'),
(14, 'Chronic Obstructive Pulmonary Disease', 'COPD including emphysema and chronic bronchitis'),
(14, 'Lung Cancer', 'Primary malignant tumors of the lung'),
(14, 'Interstitial Lung Disease', 'Diseases affecting lung parenchyma'),

-- Gastrointestinal Tract
(15, 'Inflammatory Bowel Disease', 'Crohn disease and ulcerative colitis'),
(15, 'Peptic Ulcer Disease', 'Gastric and duodenal ulcers'),
(15, 'Colorectal Cancer', 'Malignant tumors of colon and rectum'),
(15, 'Liver Cirrhosis', 'End-stage liver disease and complications');

-- Create function to get topic statistics
CREATE OR REPLACE FUNCTION get_histopathology_topic_stats(user_id_param TEXT)
RETURNS TABLE (
    topic_id INTEGER,
    topic_name VARCHAR(255),
    total_questions BIGINT,
    attempted_questions BIGINT,
    correct_answers BIGINT,
    accuracy_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ht.id as topic_id,
        ht.name as topic_name,
        COUNT(hq.id) as total_questions,
        COUNT(hqa.id) as attempted_questions,
        COUNT(CASE WHEN hqa.is_correct = true THEN 1 END) as correct_answers,
        CASE 
            WHEN COUNT(hqa.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN hqa.is_correct = true THEN 1 END)::NUMERIC / COUNT(hqa.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as accuracy_percentage
    FROM histopathology_topics ht
    LEFT JOIN histopathology_questions hq ON ht.id = hq.topic_id
    LEFT JOIN histopathology_question_attempts hqa ON hq.id = hqa.question_id AND hqa.user_id = user_id_param
    GROUP BY ht.id, ht.name
    ORDER BY ht.id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user progress for a specific topic
CREATE OR REPLACE FUNCTION get_user_histopathology_progress(user_id_param TEXT, topic_id_param INTEGER)
RETURNS TABLE (
    total_questions BIGINT,
    attempted_questions BIGINT,
    correct_answers BIGINT,
    accuracy_percentage NUMERIC,
    average_time_seconds NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(hq.id) as total_questions,
        COUNT(hqa.id) as attempted_questions,
        COUNT(CASE WHEN hqa.is_correct = true THEN 1 END) as correct_answers,
        CASE 
            WHEN COUNT(hqa.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN hqa.is_correct = true THEN 1 END)::NUMERIC / COUNT(hqa.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as accuracy_percentage,
        COALESCE(AVG(hqa.time_spent), 0) as average_time_seconds
    FROM histopathology_questions hq
    LEFT JOIN histopathology_question_attempts hqa ON hq.id = hqa.question_id AND hqa.user_id = user_id_param
    WHERE hq.topic_id = topic_id_param;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust schema name if needed)
GRANT ALL ON histopathology_topics TO authenticated;
GRANT ALL ON histopathology_subtopics TO authenticated;
GRANT ALL ON histopathology_questions TO authenticated;
GRANT ALL ON histopathology_question_attempts TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE histopathology_topics_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE histopathology_subtopics_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE histopathology_questions_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE histopathology_question_attempts_id_seq TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_histopathology_topic_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_histopathology_progress(TEXT, INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE histopathology_topics IS 'Main topics for histopathology questions organized by disease categories';
COMMENT ON TABLE histopathology_subtopics IS 'Detailed subtopics under each main histopathology topic';
COMMENT ON TABLE histopathology_questions IS 'AI-generated true/false histopathology questions';
COMMENT ON TABLE histopathology_question_attempts IS 'User attempts and performance tracking for histopathology questions';

COMMENT ON COLUMN histopathology_questions.robbins_reference IS 'Reference to Robbins Basic Pathology textbook';
COMMENT ON COLUMN histopathology_questions.chapter_page IS 'Specific chapter and page numbers from reference textbook';
COMMENT ON COLUMN histopathology_question_attempts.time_spent IS 'Time spent on question in seconds';
COMMENT ON COLUMN histopathology_question_attempts.session_id IS 'Groups questions attempted in the same study session';

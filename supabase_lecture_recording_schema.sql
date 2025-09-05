-- Lecture Recording System Schema
-- This file contains the database schema for the Docdot Lecture Assistant feature

-- Create lectures table
CREATE TABLE IF NOT EXISTS lectures (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    module TEXT NOT NULL,
    topic TEXT,
    lecturer TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    duration INTEGER DEFAULT 0, -- seconds
    status TEXT NOT NULL DEFAULT 'recording', -- recording, processing, completed, failed
    audio_url TEXT, -- URL to stored audio file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lecture_transcripts table
CREATE TABLE IF NOT EXISTS lecture_transcripts (
    id TEXT PRIMARY KEY,
    lecture_id TEXT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    raw_transcript TEXT, -- Original mixed-language transcript
    unified_transcript TEXT, -- English-only transcript
    language_detected TEXT, -- detected languages
    confidence REAL, -- transcription confidence score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lecture_notes table
CREATE TABLE IF NOT EXISTS lecture_notes (
    id TEXT PRIMARY KEY,
    lecture_id TEXT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    live_notes TEXT, -- Real-time generated notes
    final_notes TEXT, -- Post-lecture processed notes
    summary TEXT, -- AI-generated summary
    key_points JSONB, -- Array of key points
    medical_terms JSONB, -- Extracted medical terminology
    research_context TEXT, -- Additional research context
    processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lecture_processing_logs table
CREATE TABLE IF NOT EXISTS lecture_processing_logs (
    id TEXT PRIMARY KEY,
    lecture_id TEXT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    step TEXT NOT NULL, -- transcription, translation, note_generation, summarization
    status TEXT NOT NULL, -- started, completed, failed
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- milliseconds
    error_message TEXT,
    metadata JSONB, -- Additional processing metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lectures_user_id ON lectures(user_id);
CREATE INDEX IF NOT EXISTS idx_lectures_date ON lectures(date);
CREATE INDEX IF NOT EXISTS idx_lectures_status ON lectures(status);
CREATE INDEX IF NOT EXISTS idx_lectures_module ON lectures(module);
CREATE INDEX IF NOT EXISTS idx_lecture_transcripts_lecture_id ON lecture_transcripts(lecture_id);
CREATE INDEX IF NOT EXISTS idx_lecture_notes_lecture_id ON lecture_notes(lecture_id);
CREATE INDEX IF NOT EXISTS idx_lecture_processing_logs_lecture_id ON lecture_processing_logs(lecture_id);

-- Create RLS policies for security
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_processing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy for lectures table
CREATE POLICY "Users can view their own lectures" ON lectures
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own lectures" ON lectures
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own lectures" ON lectures
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own lectures" ON lectures
    FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policy for lecture_transcripts table
CREATE POLICY "Users can view transcripts of their lectures" ON lecture_transcripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_transcripts.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert transcripts for their lectures" ON lecture_transcripts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_transcripts.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update transcripts of their lectures" ON lecture_transcripts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_transcripts.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete transcripts of their lectures" ON lecture_transcripts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_transcripts.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

-- RLS Policy for lecture_notes table
CREATE POLICY "Users can view notes of their lectures" ON lecture_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_notes.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert notes for their lectures" ON lecture_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_notes.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update notes of their lectures" ON lecture_notes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_notes.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete notes of their lectures" ON lecture_notes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_notes.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

-- RLS Policy for lecture_processing_logs table
CREATE POLICY "Users can view processing logs of their lectures" ON lecture_processing_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_processing_logs.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert processing logs for their lectures" ON lecture_processing_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lectures 
            WHERE lectures.id = lecture_processing_logs.lecture_id 
            AND lectures.user_id = auth.uid()::text
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_lectures_updated_at 
    BEFORE UPDATE ON lectures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lecture_notes_updated_at 
    BEFORE UPDATE ON lecture_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get lecture statistics
CREATE OR REPLACE FUNCTION get_lecture_stats(user_id_param TEXT)
RETURNS TABLE (
    total_lectures BIGINT,
    completed_lectures BIGINT,
    total_duration BIGINT,
    avg_duration NUMERIC,
    recent_lectures BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_lectures,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_lectures,
        COALESCE(SUM(duration), 0) as total_duration,
        COALESCE(AVG(duration), 0) as avg_duration,
        COUNT(*) FILTER (WHERE date >= NOW() - INTERVAL '7 days') as recent_lectures
    FROM lectures 
    WHERE lectures.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to search lectures
CREATE OR REPLACE FUNCTION search_lectures(
    user_id_param TEXT,
    search_term TEXT DEFAULT '',
    module_filter TEXT DEFAULT '',
    status_filter TEXT DEFAULT ''
)
RETURNS TABLE (
    id TEXT,
    title TEXT,
    module TEXT,
    topic TEXT,
    lecturer TEXT,
    date TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        l.module,
        l.topic,
        l.lecturer,
        l.date,
        l.duration,
        l.status,
        l.created_at
    FROM lectures l
    WHERE l.user_id = user_id_param
    AND (search_term = '' OR l.title ILIKE '%' || search_term || '%' OR l.module ILIKE '%' || search_term || '%' OR l.topic ILIKE '%' || search_term || '%')
    AND (module_filter = '' OR l.module = module_filter)
    AND (status_filter = '' OR l.status = status_filter)
    ORDER BY l.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing (optional)
INSERT INTO lectures (id, user_id, title, module, topic, lecturer, status, duration) VALUES
('sample-lecture-1', '00000000-0000-0000-0000-000000000000', 'Introduction to Anatomy', 'Anatomy', 'Basic Concepts', 'Dr. Smith', 'completed', 3600),
('sample-lecture-2', '00000000-0000-0000-0000-000000000000', 'Cardiovascular Physiology', 'Physiology', 'Heart Function', 'Prof. Johnson', 'completed', 2700),
('sample-lecture-3', '00000000-0000-0000-0000-000000000000', 'Pathology Overview', 'Pathology', 'Disease Mechanisms', 'Dr. Brown', 'processing', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample transcripts
INSERT INTO lecture_transcripts (id, lecture_id, raw_transcript, unified_transcript, language_detected, confidence) VALUES
('transcript-1', 'sample-lecture-1', 'Today we will discuss the basic concepts of human anatomy...', 'Today we will discuss the basic concepts of human anatomy...', 'en', 0.95),
('transcript-2', 'sample-lecture-2', 'The cardiovascular system is responsible for...', 'The cardiovascular system is responsible for...', 'en', 0.92)
ON CONFLICT (id) DO NOTHING;

-- Insert sample notes
INSERT INTO lecture_notes (id, lecture_id, live_notes, final_notes, summary, key_points, medical_terms, processing_status) VALUES
('notes-1', 'sample-lecture-1', 'Key anatomical terms and structures...', 'Comprehensive notes on basic anatomy...', 'Summary of anatomical concepts covered in lecture.', '["anatomy", "structure", "function"]', '["anatomy", "physiology", "structure"]', 'completed'),
('notes-2', 'sample-lecture-2', 'Cardiovascular system components...', 'Detailed notes on heart function...', 'Summary of cardiovascular physiology concepts.', '["heart", "circulation", "blood"]', '["cardiovascular", "heart", "circulation"]', 'completed')
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON lectures TO authenticated;
GRANT ALL ON lecture_transcripts TO authenticated;
GRANT ALL ON lecture_notes TO authenticated;
GRANT ALL ON lecture_processing_logs TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_lecture_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_lectures(TEXT, TEXT, TEXT, TEXT) TO authenticated;

COMMENT ON TABLE lectures IS 'Stores lecture metadata and basic information';
COMMENT ON TABLE lecture_transcripts IS 'Stores raw and processed transcripts of lectures';
COMMENT ON TABLE lecture_notes IS 'Stores live and final notes generated from lectures';
COMMENT ON TABLE lecture_processing_logs IS 'Tracks the processing status and logs of lecture analysis';

COMMENT ON COLUMN lectures.status IS 'Current status: recording, processing, completed, failed';
COMMENT ON COLUMN lectures.duration IS 'Duration in seconds';
COMMENT ON COLUMN lecture_transcripts.confidence IS 'Transcription confidence score (0.0 to 1.0)';
COMMENT ON COLUMN lecture_notes.processing_status IS 'Status of note processing: pending, processing, completed, failed';

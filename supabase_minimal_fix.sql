-- Minimal fix for immediate column issues
ALTER TABLE users ADD COLUMN specialization TEXT;
ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE user_stats ADD COLUMN level INTEGER DEFAULT 1;

-- Update existing data
UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, '');
UPDATE user_stats SET level = current_level;
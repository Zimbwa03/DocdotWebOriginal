-- Add the exact missing columns that the application expects

-- Add level column to user_stats (the app expects 'level' not 'current_level')
ALTER TABLE user_stats ADD COLUMN level INTEGER DEFAULT 1;

-- Add full_name column to users (some parts of the app expect this)
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Update existing data
UPDATE user_stats SET level = current_level;
UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, '');
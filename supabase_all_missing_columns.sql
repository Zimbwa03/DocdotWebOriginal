-- Add ALL missing columns that the application expects

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Add missing columns to user_stats table  
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Update existing data to maintain consistency
UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, '') WHERE full_name IS NULL;
UPDATE user_stats SET level = current_level WHERE level IS NULL;

-- Create a function to sync user_stats level with users level
CREATE OR REPLACE FUNCTION sync_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user_stats level when users level changes
    UPDATE user_stats SET level = NEW.level WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep levels synchronized
DROP TRIGGER IF EXISTS trigger_sync_user_level ON users;
CREATE TRIGGER trigger_sync_user_level
    AFTER UPDATE OF level ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_level();
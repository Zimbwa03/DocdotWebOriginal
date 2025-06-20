-- Schema alignment fix for remaining column mismatches

-- Fix user_stats table - add missing 'level' column (application expects 'level' not 'current_level')
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Fix users table - add missing 'full_name' column that some parts of the app expect
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update any existing data to sync level columns
UPDATE user_stats SET level = current_level WHERE level IS NULL;

-- Create a function to auto-update full_name when first_name or last_name changes
CREATE OR REPLACE FUNCTION update_user_full_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically maintain full_name
DROP TRIGGER IF EXISTS trigger_update_full_name ON users;
CREATE TRIGGER trigger_update_full_name
    BEFORE INSERT OR UPDATE OF first_name, last_name ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_full_name();

-- Update existing users to have full_name
UPDATE users SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL;
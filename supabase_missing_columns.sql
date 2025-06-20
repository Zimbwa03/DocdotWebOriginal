-- Add missing columns that the application code expects
ALTER TABLE user_stats ADD COLUMN level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN full_name TEXT;
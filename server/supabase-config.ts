import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Database connection string for Drizzle
export const DATABASE_URL = process.env.DATABASE_URL;

// Export the connection string for use in other files
export default DATABASE_URL;

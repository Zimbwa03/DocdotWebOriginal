import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Database connection string for Drizzle
export const DATABASE_URL = 'postgresql://postgres:Ngonidzashe2003.@db.jncxejkssgvxhdurmvxy.supabase.co:5432/postgres';

// Export the connection string for use in other files
export default DATABASE_URL;

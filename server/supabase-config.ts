import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOnN1cGFzZSIsInJlZiI6ImpuY3hlamtzc2d2eGhkdXJtdnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODAyNTYsImV4cCI6MjA2MzE1NjI1Nn0.YanAtJ88RrKlnMW8YhRJOkxoGEK8OhOqP9jcI-ZYB7o';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Database connection string for Drizzle - Use Supabase database
export const DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

// Export the connection string for use in other files
export default DATABASE_URL;

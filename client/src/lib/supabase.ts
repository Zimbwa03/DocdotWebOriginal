import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3hlanNrc2d2eGhkdXJtdnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjY2NDEsImV4cCI6MjA1OTU0MjY0MX0.YVmGZlY8Ps9PQ8pGFqQJHiLtO7cBxQP8Qj6jK2lJc0I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

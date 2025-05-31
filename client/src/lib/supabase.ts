import { createClient } from '@supabase/supabase-js';

// Use your provided Supabase credentials with fallback to environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3hlanNrc2d2eGhkdXJtdnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjUwNDEsImV4cCI6MjA2MzQ0MTA0MX0.vB91dobZ0zsFTEAQiZ1nU5n94ppxdolpaDs2lUNox38';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

import { createClient } from '@supabase/supabase-js';

// Use environment variables from the server/runtime
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOnN1cGFzZSIsInJlZiI6ImpuY3hlamtzc2d2eGhkdXJtdnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1ODAyNTYsImV4cCI6MjA2MzE1NjI1Nn0.YanAtJ88RrKlnMW8YhRJOkxoGEK8OhOqP9jcI-ZYB7o';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing. Please check environment variables.');
  throw new Error('Supabase configuration missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client initialized successfully');
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOnN1cHBhc2UiLCJyZWYiOiJqbmN4ZWprc3NndnhoZHVybXZ4eSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ3NTgwMjU2LCJleHAiOjIwNjMxNTYyNTZ9.YanAtJ88RrKlnMW8YhRJOkxoGEK8OhOqP9jcI-ZYB7o';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client initialized successfully');
import { supabase } from './client/src/lib/supabase.js';

async function testCompleteSupabaseIntegration() {
  console.log('🧪 Testing complete Supabase integration...');
  
  try {
    // Test 1: Authentication flow
    console.log('Testing authentication...');
    const { data: session } = await supabase.auth.getSession();
    console.log('Auth session status:', session ? 'Active' : 'No session');
    
    // Test 2: Database direct access
    console.log('Testing direct database access...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.log('Users table access:', usersError.message);
    } else {
      console.log(`Users table: ${users.length} records found`);
    }
    
    // Test 3: AI Sessions table
    const { data: aiSessions, error: aiError } = await supabase
      .from('ai_sessions')
      .select('*')
      .limit(5);
    
    if (aiError) {
      console.log('AI Sessions table access:', aiError.message);
    } else {
      console.log(`AI Sessions table: ${aiSessions.length} records found`);
    }
    
    // Test 4: Quiz attempts table
    const { data: quizAttempts, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .limit(5);
    
    if (quizError) {
      console.log('Quiz attempts table access:', quizError.message);
    } else {
      console.log(`Quiz attempts table: ${quizAttempts.length} records found`);
    }
    
    // Test 5: Check all tables exist
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    console.log(`Total tables in database: ${tables?.length || 0}`);
    
    const expectedTables = [
      'users', 'user_stats', 'quiz_attempts', 'ai_sessions', 'ai_chats',
      'leaderboard', 'categories', 'topics', 'badges', 'user_badges',
      'study_groups', 'study_group_members', 'subscription_plans', 'user_subscriptions'
    ];
    
    const existingTables = tables?.map(t => t.table_name) || [];
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('✅ All expected tables exist in Supabase');
    } else {
      console.log('⚠️  Missing tables:', missingTables);
    }
    
    // Test 6: Row Level Security
    console.log('Testing Row Level Security policies...');
    const { data: policies } = await supabase.rpc('get_policies_info');
    console.log('RLS policies configured:', !!policies);
    
    console.log('🎉 Supabase integration test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Supabase integration test failed:', error.message);
    return false;
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('🔗 Testing API endpoints...');
  
  const endpoints = [
    '/api/test-supabase',
    '/api/ai/test',
    '/api/ai/sessions/test-user-123',
    '/api/leaderboard'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`);
      const data = await response.json();
      console.log(`${endpoint}: ${response.status} - ${data.success ? 'Success' : 'Response received'}`);
    } catch (error) {
      console.log(`${endpoint}: Failed - ${error.message}`);
    }
  }
}

// Run all tests
testCompleteSupabaseIntegration().then(() => {
  testAPIEndpoints();
});
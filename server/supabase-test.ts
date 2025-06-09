import { db, storage } from './db';
import { sql } from 'drizzle-orm';

async function comprehensiveSupabaseTest() {
  console.log('🧪 Running comprehensive Supabase integration test...');
  
  try {
    // Test 1: Basic connection
    await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Basic database connection working');
    
    // Test 2: Check all tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📊 Found ${tables.length} tables in Supabase`);
    
    // Test 3: Test user operations
    const testUserId = 'test-user-' + Date.now();
    const testEmail = `test-${Date.now()}@docdot.app`;
    
    const user = await storage.createUser({
      id: testUserId,
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User'
    });
    console.log('✅ User creation successful');
    
    // Test 4: Test AI session creation
    const aiSession = await storage.createAiSession(testUserId, 'tutor', 'Test AI Session');
    console.log('✅ AI session creation successful');
    
    // Test 5: Test AI message tracking
    await storage.addAiMessage(aiSession.id, testUserId, 'user', 'What is anatomy?', 'tutor');
    await storage.addAiMessage(aiSession.id, testUserId, 'assistant', 'Anatomy is the study of body structure...', 'tutor');
    console.log('✅ AI message tracking successful');
    
    // Test 6: Test quiz attempt recording
    await storage.recordQuizAttempt({
      userId: testUserId,
      category: 'Anatomy',
      selectedAnswer: 'A',
      correctAnswer: 'A',
      isCorrect: true,
      timeSpent: 15,
      xpEarned: 10
    });
    console.log('✅ Quiz attempt recording successful');
    
    // Test 7: Test analytics retrieval
    const userStats = await storage.getUserStats(testUserId);
    console.log('✅ User stats retrieval successful');
    
    // Test 8: Test AI session retrieval
    const sessions = await storage.getAiSessions(testUserId);
    console.log(`✅ Retrieved ${sessions.length} AI sessions`);
    
    // Test 9: Test AI message retrieval
    const messages = await storage.getAiMessages(aiSession.id);
    console.log(`✅ Retrieved ${messages.length} AI messages`);
    
    // Cleanup test data
    await db.execute(sql`DELETE FROM users WHERE id = ${testUserId}`);
    console.log('✅ Test cleanup completed');
    
    console.log('🎉 All Supabase integration tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
}

export { comprehensiveSupabaseTest };
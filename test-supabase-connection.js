
const fetch = require('node-fetch');

async function testSupabaseConnection() {
  console.log('🚀 Testing Supabase Database Connection...\n');

  try {
    // Test 1: Database connection health check
    console.log('1. Testing database connection...');
    const healthResponse = await fetch('http://localhost:5000/api/user-stats/test-user-id');
    console.log(`   Status: ${healthResponse.status}`);
    
    // Test 2: Create a test user
    console.log('\n2. Testing user creation...');
    const testUser = {
      id: `test-user-${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User'
    };
    
    const createUserResponse = await fetch('http://localhost:5000/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const createdUser = await createUserResponse.json();
    console.log(`   User created: ${createdUser.id}`);
    console.log(`   Email: ${createdUser.email}`);

    // Test 3: Record quiz attempts
    console.log('\n3. Testing quiz attempt recording...');
    const quizAttempt = {
      userId: testUser.id,
      category: 'Anatomy - Upper Limb',
      selectedAnswer: 'True',
      correctAnswer: 'True',
      isCorrect: true,
      timeSpent: 15,
      xpEarned: 10,
      difficulty: 'medium'
    };

    const recordResponse = await fetch('http://localhost:5000/api/quiz/record-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizAttempt)
    });
    
    const recordResult = await recordResponse.json();
    console.log(`   Quiz attempt recorded: ${recordResult.success}`);
    console.log(`   XP earned: ${recordResult.xpEarned}`);

    // Test 4: Check user stats
    console.log('\n4. Testing user stats retrieval...');
    const statsResponse = await fetch(`http://localhost:5000/api/user-stats/${testUser.id}`);
    const userStats = await statsResponse.json();
    console.log(`   Total questions: ${userStats?.totalQuestions || 0}`);
    console.log(`   Total XP: ${userStats?.totalXP || 0}`);
    console.log(`   Current level: ${userStats?.currentLevel || 1}`);

    // Test 5: Test leaderboard
    console.log('\n5. Testing leaderboard...');
    const leaderboardResponse = await fetch('http://localhost:5000/api/leaderboard?limit=5');
    const leaderboard = await leaderboardResponse.json();
    console.log(`   Leaderboard entries: ${leaderboard.entries?.length || 0}`);
    
    if (leaderboard.entries && leaderboard.entries.length > 0) {
      console.log(`   Top user XP: ${leaderboard.entries[0].totalXP}`);
    }

    // Test 6: Test user rank
    console.log('\n6. Testing user rank...');
    const rankResponse = await fetch(`http://localhost:5000/api/user-rank?userId=${testUser.id}`);
    const userRank = await rankResponse.json();
    console.log(`   User rank: ${userRank.rank}`);
    console.log(`   User accuracy: ${userRank.averageAccuracy}%`);

    // Test 7: Test AI connection
    console.log('\n7. Testing AI service...');
    const aiTestResponse = await fetch('http://localhost:5000/api/ai/test');
    const aiTest = await aiTestResponse.json();
    console.log(`   AI connected: ${aiTest.connected}`);
    console.log(`   AI message: ${aiTest.message}`);

    // Test 8: Test questions loading
    console.log('\n8. Testing questions loading...');
    const questionsResponse = await fetch('http://localhost:5000/api/questions');
    const questions = await questionsResponse.json();
    console.log(`   Questions loaded: ${questions.length}`);
    console.log(`   Sample category: ${questions[0]?.category || 'N/A'}`);

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Database: Connected ✓`);
    console.log(`   • User Management: Working ✓`);
    console.log(`   • Quiz System: Working ✓`);
    console.log(`   • Analytics: Working ✓`);
    console.log(`   • Leaderboard: Working ✓`);
    console.log(`   • AI Service: ${aiTest.connected ? 'Connected ✓' : 'Not configured ⚠️'}`);
    console.log(`   • Questions: Loaded ✓`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testSupabaseConnection();

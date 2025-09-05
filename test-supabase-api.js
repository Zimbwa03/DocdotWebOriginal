// Test Supabase API endpoints
const testSupabaseAPI = async () => {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Supabase API endpoints...');
  
  try {
    // Test MCQ topics endpoint
    console.log('\n1. Testing MCQ topics endpoint...');
    const topicsResponse = await fetch(`${baseUrl}/api/mcq-topics?category=Upper%20Limb`);
    
    if (topicsResponse.ok) {
      const topics = await topicsResponse.json();
      console.log('✅ Topics endpoint working!');
      console.log(`📋 Found ${topics.length} topics:`, topics);
    } else {
      console.log('❌ Topics endpoint failed:', topicsResponse.status, topicsResponse.statusText);
    }
    
    // Test MCQ questions endpoint for a specific topic
    console.log('\n2. Testing MCQ questions endpoint...');
    const questionsResponse = await fetch(`${baseUrl}/api/mcq-questions?topic=Arm&category=Upper%20Limb&limit=3`);
    
    if (questionsResponse.ok) {
      const questions = await questionsResponse.json();
      console.log('✅ Questions endpoint working!');
      console.log(`📚 Found ${questions.length} questions for Arm topic:`, questions);
    } else {
      console.log('❌ Questions endpoint failed:', questionsResponse.status, questionsResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testSupabaseAPI();




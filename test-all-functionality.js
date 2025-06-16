// Comprehensive test for all application functionality
const testUserId = "a45b9d10-e419-4a35-8321-ca57120be2c2";
const baseUrl = "http://localhost:5000";

const tests = [
  // Core API endpoints
  { name: "Health Check", url: "/api/health", method: "GET" },
  { name: "User Profile", url: `/api/user/${testUserId}`, method: "GET" },
  { name: "User Stats", url: `/api/user-stats/${testUserId}`, method: "GET" },
  { name: "Quiz Attempts", url: `/api/quiz-attempts/${testUserId}`, method: "GET" },
  { name: "Badges", url: `/api/badges/${testUserId}`, method: "GET" },
  { name: "Study Groups", url: "/api/study-groups", method: "GET" },
  { name: "Study Sessions", url: `/api/study-sessions/${testUserId}`, method: "GET" },
  { name: "Leaderboard", url: "/api/leaderboard", method: "GET" },
  { name: "Questions", url: "/api/questions", method: "GET" },
  
  // AI endpoints
  { name: "AI Chat", url: "/api/ai/chat", method: "POST", 
    body: { message: "What is anatomy?", userId: testUserId } },
  { name: "AI Explain", url: "/api/ai/explain", method: "POST", 
    body: { concept: "Heart anatomy", level: "intermediate", userId: testUserId } },
  { name: "AI Questions", url: "/api/ai/questions", method: "POST", 
    body: { topic: "Cardiology", difficulty: "medium", count: 3, userId: testUserId } },
  { name: "AI Study Plan", url: "/api/ai/study-plan", method: "POST", 
    body: { goals: ["Learn anatomy"], timeframe: "4 weeks", currentLevel: "beginner", userId: testUserId } },
];

async function runTest(test) {
  try {
    const options = {
      method: test.method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (test.body) {
      options.body = JSON.stringify(test.body);
    }
    
    const response = await fetch(baseUrl + test.url, options);
    const isSuccess = response.ok;
    const status = response.status;
    
    let responseData = "";
    try {
      const text = await response.text();
      responseData = text.substring(0, 200) + (text.length > 200 ? "..." : "");
    } catch (e) {
      responseData = "Could not read response";
    }
    
    return {
      name: test.name,
      success: isSuccess,
      status: status,
      response: responseData
    };
  } catch (error) {
    return {
      name: test.name,
      success: false,
      status: "ERROR",
      response: error.message
    };
  }
}

async function runAllTests() {
  console.log("🧪 Starting comprehensive application functionality test...\n");
  
  const results = [];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}...`);
    const result = await runTest(test);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${test.name}: PASSED (${result.status})`);
    } else {
      console.log(`❌ ${test.name}: FAILED (${result.status}) - ${result.response.substring(0, 100)}`);
    }
  }
  
  console.log("\n📊 Test Summary:");
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log("\n🔍 Failed Tests Details:");
    results.filter(r => !r.success).forEach(result => {
      console.log(`- ${result.name}: ${result.status} - ${result.response}`);
    });
  }
}

// Run the tests
runAllTests().catch(console.error);
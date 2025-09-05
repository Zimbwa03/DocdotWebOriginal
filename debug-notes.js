// Debug script to test note generation
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAI() {
  console.log('🧪 Testing Gemini AI connection...');
  
  // Check environment variable
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔑 API Key present:', apiKey ? 'Yes' : 'No');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY environment variable is missing');
    console.log('💡 Please set it with: export GEMINI_API_KEY=your_api_key_here');
    return;
  }
  
  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('✅ Gemini AI initialized successfully');
    
    // Test with simple prompt
    const testPrompt = 'Generate a simple note about anatomy.';
    console.log('🤖 Sending test prompt...');
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Test successful!');
    console.log('📝 Generated text length:', text.length);
    console.log('📝 Generated text preview:', text.substring(0, 200));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('💡 Your API key is invalid. Please check it.');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('💡 You have exceeded your API quota.');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('💡 Permission denied. Check your API key permissions.');
    } else {
      console.log('💡 Unknown error. Check your internet connection and API key.');
    }
  }
}

// Run the test
testGeminiAI();

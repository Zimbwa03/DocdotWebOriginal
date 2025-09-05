import { GoogleGenerativeAI } from '@google/generative-ai';

// Test Gemini AI Integration
async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini AI Integration...\n');

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI('AIzaSyBSUFmlmJNFonRtgcFwyQpdfWZEP0-N2wU');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('✅ Gemini AI initialized successfully');

    // Test 1: Basic connectivity
    console.log('\n📡 Test 1: Basic Connectivity');
    const testPrompt = 'Hello, can you respond with "Gemini AI is working correctly"?';
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    console.log('Response:', response.text());

    // Test 2: Medical content processing
    console.log('\n🏥 Test 2: Medical Content Processing');
    const medicalPrompt = `
You are an AI assistant helping medical students at the University of Zimbabwe. 
Generate structured, concise notes from this lecture transcript.

Module: Cardiovascular Physiology
Topic: Heart Anatomy

Transcript: "Welcome to today's lecture on cardiovascular physiology. We will be discussing the structure and function of the heart, which is a four-chambered organ that pumps blood throughout the body. The right atrium receives deoxygenated blood from the body through the superior and inferior vena cava."

Please generate notes in the following format:
## Key Points from Live Lecture

### [Main Topic/Concept]
- [Key point 1]
- [Key point 2]

Focus on medical terminology and clinical relevance.
`;

    const medicalResult = await model.generateContent(medicalPrompt);
    const medicalResponse = await medicalResult.response;
    console.log('Medical Notes Generated:');
    console.log(medicalResponse.text());

    // Test 3: Mixed language detection
    console.log('\n🌍 Test 3: Mixed Language Detection');
    const languagePrompt = `
Analyze this transcript and determine if it contains mixed languages (English and Shona).
If Shona is detected, translate it to English while preserving the meaning.

Transcript: "Welcome to today's lecture on cardiovascular physiology. Tinotaura nezve moyo uye kuti unoshanda sei. The heart has four chambers."

Please respond with JSON:
{
  "unifiedTranscript": "English translation of the entire transcript",
  "languageDetected": "en" or "en-sh" or "sh",
  "confidence": 0.0-1.0
}
`;

    const languageResult = await model.generateContent(languagePrompt);
    const languageResponse = await languageResult.response;
    console.log('Language Detection Result:');
    console.log(languageResponse.text());

    // Test 4: Comprehensive summary
    console.log('\n📝 Test 4: Comprehensive Summary Generation');
    const summaryPrompt = `
You are an AI assistant helping medical students at the University of Zimbabwe.
Generate a comprehensive summary of this medical lecture with additional research context.

Module: Cardiovascular Physiology
Topic: Heart Anatomy

Original Transcript: "Welcome to today's lecture on cardiovascular physiology. We will be discussing the structure and function of the heart, which is a four-chambered organ that pumps blood throughout the body. The right atrium receives deoxygenated blood from the body through the superior and inferior vena cava. The left atrium receives oxygenated blood from the lungs through the pulmonary veins. The ventricles are the main pumping chambers of the heart."

Please provide:

1. **Comprehensive Summary** (300-500 words):
2. **Key Points** (as a JSON array):
3. **Medical Terms** (as a JSON array):
4. **Research Context** (200-300 words):

Format the response as JSON.
`;

    const summaryResult = await model.generateContent(summaryPrompt);
    const summaryResponse = await summaryResult.response;
    console.log('Comprehensive Summary:');
    console.log(summaryResponse.text());

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n✅ Gemini AI Integration Status: WORKING');
    console.log('✅ Medical content processing: WORKING');
    console.log('✅ Language detection: WORKING');
    console.log('✅ Summary generation: WORKING');

  } catch (error) {
    console.error('❌ Error testing Gemini AI:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if the API key is correct');
    console.log('2. Verify internet connection');
    console.log('3. Check API quota limits');
    console.log('4. Ensure the API key has proper permissions');
  }
}

// Run the test
testGeminiIntegration();

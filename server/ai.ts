// Using Node.js built-in fetch (available in Node 18+)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/chat/completions';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenRouterAI {
  private apiKey: string | null;
  private responseCache: Map<string, { response: string; timestamp: number }>;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.apiKey = DEEPSEEK_API_KEY || null;
    this.responseCache = new Map();
    if (!this.apiKey) {
      console.warn('❌ DEEPSEEK_API_KEY is not configured - AI features will be disabled');
      console.log('Available API-related environment variables:', Object.keys(process.env).filter(key => key.includes('API')));
    } else {
      console.log('✅ AI service initialized successfully with DeepSeek API');
      console.log('API Key configured:', this.apiKey.substring(0, 8) + '...');
    }
  }

  private getCacheKey(messages: AIMessage[], temperature: number): string {
    return JSON.stringify({ messages: messages.slice(-2), temperature }); // Only cache last 2 messages
  }

  private getFromCache(key: string): string | null {
    const cached = this.responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response;
    }
    if (cached) {
      this.responseCache.delete(key); // Remove expired cache
    }
    return null;
  }

  private setCache(key: string, response: string): void {
    this.responseCache.set(key, { response, timestamp: Date.now() });
    
    // Clean old cache entries (keep only last 100)
    if (this.responseCache.size > 100) {
      const entries = Array.from(this.responseCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      this.responseCache.clear();
      entries.slice(0, 50).forEach(([k, v]) => this.responseCache.set(k, v));
    }
  }

  private checkApiKey(): boolean {
    if (!this.apiKey) {
      console.error('DeepSeek API key not configured');
      return false;
    }
    return true;
  }

  async generateResponse(messages: AIMessage[], temperature = 0.7): Promise<string> {
    if (!this.checkApiKey()) {
      throw new Error('AI service not available - API key not configured');
    }

    // Check cache first
    const cacheKey = this.getCacheKey(messages, temperature);
    const cachedResponse = this.getFromCache(cacheKey);
    if (cachedResponse) {
      console.log('Returning cached AI response');
      return cachedResponse;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Reduced to 15 seconds

      console.log('Making request to DeepSeek API...');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DocDot-Medical-App/1.0'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature,
          max_tokens: 800, // Further reduced for faster responses
          stream: false,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('DeepSeek API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          throw new Error('Invalid API key - please check your DeepSeek API key configuration');
        } else if (response.status === 429) {
          throw new Error('API rate limit exceeded - please try again in a few seconds');
        } else if (response.status >= 500) {
          throw new Error('DeepSeek service is temporarily unavailable - please try again later');
        }
        
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as any;
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid response from AI service');
      }
      
      const result = data.choices[0].message.content || 'I apologize, but I could not generate a response.';
      
      // Cache the response
      this.setCache(cacheKey, result);
      
      console.log('AI response generated successfully');
      return result;
    } catch (error: any) {
      console.error('AI Generation Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      });
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 15 seconds. Please try again with a shorter question.');
      }
      
      if (error.message?.includes('fetch failed') || error.code === 'ENOTFOUND') {
        throw new Error('Network connection failed. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // Medical Question Generation
  async generateMedicalQuestions(topic: string, difficulty: string, count: number = 5): Promise<any[]> {
    if (!this.checkApiKey()) {
      throw new Error('AI service not available - API key not configured');
    }

    // Validate inputs
    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic is required');
    }

    const sanitizedTopic = topic.trim();
    const validCount = Math.min(Math.max(count, 1), 10);

    const systemPrompt = `You are an expert medical educator creating True/False questions for medical students.

    CRITICAL REQUIREMENTS:
    1. Generate EXACTLY ${validCount} True/False questions about "${sanitizedTopic}"
    2. Difficulty level: ${difficulty}
    3. Respond with ONLY a valid JSON array - no extra text
    4. Each question must be medically accurate and evidence-based

    JSON Format (EXACT):
    [
      {
        "question": "The heart has four chambers",
        "correctAnswer": "True",
        "explanation": "The heart consists of two atria and two ventricles, making four chambers total",
        "category": "${sanitizedTopic}",
        "difficulty": "${difficulty}"
      }
    ]

    Requirements:
    - Questions must be True/False only
    - Include clear, educational explanations
    - Use proper medical terminology
    - Return ONLY the JSON array`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate ${validCount} medical True/False questions about "${sanitizedTopic}" at ${difficulty} level for medical students. Return only valid JSON.` }
    ];

    try {
      console.log(`Generating ${validCount} questions about "${sanitizedTopic}" at ${difficulty} level`);
      const response = await this.generateResponse(messages, 0.2);
      
      if (!response || response.trim().length === 0) {
        throw new Error('Empty response from AI service');
      }

      console.log('Raw AI response:', response.substring(0, 200) + '...');
      
      // Clean the response to extract JSON
      let jsonString = response.trim();
      
      // Remove common prefixes/suffixes
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      // Find JSON array bounds
      const jsonStart = jsonString.indexOf('[');
      const jsonEnd = jsonString.lastIndexOf(']');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON array found in response');
      }
      
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Failed JSON string:', jsonString);
        throw new Error('Invalid JSON format in AI response');
      }
      
      // Ensure it's an array
      const questions = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      
      if (questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Validate and format questions
      const formattedQuestions = questions.slice(0, validCount).map((q: any, index: number) => {
        if (!q.question || typeof q.question !== 'string') {
          throw new Error(`Invalid question format at index ${index}`);
        }

        return {
          question: q.question.trim(),
          options: ['True', 'False'],
          correctAnswer: q.correctAnswer || q.correct_answer || 'True',
          correct_answer: q.correctAnswer || q.correct_answer || 'True',
          explanation: q.explanation || `Explanation for question about ${sanitizedTopic}`,
          category: sanitizedTopic,
          difficulty: difficulty
        };
      });

      console.log(`Successfully generated ${formattedQuestions.length} questions`);
      return formattedQuestions;

    } catch (error: any) {
      console.error('Question generation error details:', {
        message: error.message,
        name: error.name,
        topic: sanitizedTopic,
        count: validCount
      });
      
      // If AI fails, provide educational fallback questions
      if (error.message?.includes('API key') || error.message?.includes('not configured')) {
        throw error; // Re-throw configuration errors
      }
      
      console.log('Providing fallback questions due to AI error');
      return this.generateFallbackQuestions(sanitizedTopic, difficulty, validCount);
    }
  }

  // Fallback question generator
  private generateFallbackQuestions(topic: string, difficulty: string, count: number): any[] {
    const fallbackQuestions = [
      {
        question: `${topic} is an important topic in medical education`,
        correctAnswer: 'True',
        explanation: `${topic} is indeed a fundamental concept that medical students need to understand thoroughly`
      },
      {
        question: `Understanding ${topic} requires memorization only`,
        correctAnswer: 'False',
        explanation: `Medical education requires both understanding concepts and practical application, not just memorization`
      },
      {
        question: `${topic} has clinical applications in patient care`,
        correctAnswer: 'True',
        explanation: `Most medical topics have direct or indirect applications in clinical practice and patient care`
      },
      {
        question: `${topic} is unrelated to other medical subjects`,
        correctAnswer: 'False',
        explanation: `Medical subjects are interconnected, and ${topic} likely relates to other areas of medicine`
      },
      {
        question: `Studying ${topic} helps in medical diagnosis`,
        correctAnswer: 'True',
        explanation: `Understanding medical concepts like ${topic} contributes to better diagnostic skills`
      }
    ];

    return fallbackQuestions.slice(0, count).map((q, index) => ({
      ...q,
      options: ['True', 'False'],
      correct_answer: q.correctAnswer,
      category: topic,
      difficulty: difficulty
    }));
  }

  // Medical Tutor Chat
  async tutorResponse(userQuestion: string, context?: string): Promise<string> {
    const systemPrompt = `You are an expert medical tutor 👨‍⚕️. Provide concise, accurate medical education responses.
    
    FORMATTING:
    - Start with greeting emoji
    - Use **bold** for key medical terms
    - Structure with emoji headers
    - Keep responses focused and under 500 words
    
    CONTENT:
    - Accurate, evidence-based information
    - Clear language for medical students
    - Include practical examples
    - End with encouragement
    
    STRUCTURE:
    [Emoji] Great question!
    
    📖 **Key Concept:** [Brief explanation with **bold** terms]
    
    🔍 **Important Points:**
    • [Point 1]
    • [Point 2]
    
    🏥 **Clinical Application:** [Brief practical relevance]
    
    ✨ Keep studying!
    
    ${context ? `Context: ${context}` : ''}`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuestion }
    ];

    return await this.generateResponse(messages, 0.8);
  }

  // Study Plan Generation
  async generateStudyPlan(goals: string[], timeframe: string, currentLevel: string): Promise<any> {
    const systemPrompt = `You are a medical education specialist. Create a comprehensive study plan based on the student's goals and timeframe.
    
    Return a JSON object with this structure:
    {
      "title": "Study plan title",
      "duration": "${timeframe}",
      "level": "${currentLevel}",
      "weeklySchedule": [
        {
          "week": 1,
          "focus": "Topic focus",
          "dailyTasks": ["Task 1", "Task 2", "Task 3"],
          "resources": ["Resource 1", "Resource 2"],
          "assessments": ["Quiz on topic X"]
        }
      ],
      "milestones": ["Milestone 1", "Milestone 2"],
      "tips": ["Study tip 1", "Study tip 2"]
    }`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create a study plan for: ${goals.join(', ')} over ${timeframe} for a ${currentLevel} level student` }
    ];

    try {
      const response = await this.generateResponse(messages, 0.3);
      return JSON.parse(response);
    } catch (error) {
      console.error('Study plan generation error:', error);
      return null;
    }
  }

  // Concept Explanation
  async explainConcept(concept: string, level: string = 'intermediate'): Promise<string> {
    const systemPrompt = `You are a medical educator explaining complex concepts clearly at ${level} level.
    
    FORMATTING REQUIREMENTS:
    - Start with concept emoji and **bold concept name**
    - Use structured sections with emojis
    - Bold all key medical terms
    - Include relevant emojis throughout
    - End with study encouragement
    
    Response Structure:
    🧠 **${concept}** - ${level.charAt(0).toUpperCase() + level.slice(1)} Level Explanation
    
    📖 **Definition:**
    [Clear definition with **bold** key terms]
    
    🔑 **Key Components:**
    • [Component 1 with **bold** terms]
    • [Component 2 with **bold** terms]
    • [Component 3 with **bold** terms]
    
    🏥 **Clinical Significance:**
    [Why this matters in practice]
    
    🧩 **Related Concepts:**
    [Connected topics]
    
    💡 **Memory Aid:**
    [Mnemonic or study tip if applicable]
    
    ✨ Understanding ${concept} is crucial for medical practice!`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explain: ${concept}` }
    ];

    return await this.generateResponse(messages, 0.6);
  }

  // Generate Custom Exam with AI-powered stems
  async generateCustomExam(topics: string[], stemCount: number, examType: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('AI service not configured - API key missing');
    }

    const validStemCount = Math.max(5, Math.min(stemCount, 50));
    console.log(`Generating custom ${examType} exam with ${validStemCount} stems for topics:`, topics);

    // Force DeepSeek AI generation - no fallback templates
    console.log(`🤖 Calling DeepSeek AI for ${validStemCount} ${examType} exam stems on topics: ${topics.join(', ')}`);
    
    const systemPrompt = `You are a medical education expert creating professional ${examType} exam stems.

Generate ${validStemCount} exam stems for: ${topics.join(', ')}

FORMAT: Each stem follows "Concerning the [specific anatomical/physiological aspect]" with 2 true/false options.

REQUIRED JSON OUTPUT:
{
  "stems": [
    {
      "id": "stem_1",
      "stemText": "Concerning the bones of the upper limb",
      "orderIndex": 1,
      "options": [
        {
          "id": "option_1_a",
          "optionLetter": "A", 
          "statement": "The clavicle is the most commonly fractured bone in falls",
          "answer": true,
          "explanation": "Clavicle fractures occur frequently during falls"
        },
        {
          "id": "option_1_b",
          "optionLetter": "B",
          "statement": "The radius is located medial to the ulna",
          "answer": false,
          "explanation": "Radius is lateral to ulna in anatomical position"
        }
      ]
    }
  ]
}

Generate ${validStemCount} medically accurate stems. Return ONLY valid JSON.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create ${validStemCount} professional ${examType} exam stems covering ${topics.join(', ')}. Use "Concerning the..." format with True/False medical statements.` }
    ];

    console.log('🔄 Sending request to DeepSeek API...');
    const response = await this.generateResponse(messages, 0.2);
    
    if (!response || response.trim().length === 0) {
      throw new Error('DeepSeek API returned empty response');
    }

    console.log('✅ DeepSeek response received, processing...');
    console.log('📄 Raw response preview:', response.substring(0, 150) + '...');
    
    // Extract and parse JSON from DeepSeek response with better error handling
    let jsonString = response.trim();
    jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    const jsonStart = jsonString.indexOf('{');
    let jsonEnd = jsonString.lastIndexOf('}');
    
    if (jsonStart === -1) {
      throw new Error('No valid JSON structure found in DeepSeek response');
    }
    
    // Handle truncated JSON by trying to repair it
    if (jsonEnd === -1 || jsonEnd < jsonStart + 50) {
      console.log('🔧 Attempting to repair truncated JSON response...');
      // Find the last complete stem in the response
      const stemsStart = jsonString.indexOf('"stems":');
      if (stemsStart !== -1) {
        let repairPoint = jsonString.lastIndexOf('},{');
        if (repairPoint === -1) {
          repairPoint = jsonString.lastIndexOf('{');
        }
        if (repairPoint > stemsStart) {
          jsonString = jsonString.substring(0, repairPoint) + '}]}';
          jsonEnd = jsonString.lastIndexOf('}');
        }
      }
    }
    
    if (jsonEnd === -1) {
      throw new Error('Unable to repair truncated JSON from DeepSeek');
    }
    
    jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
    
    let aiResponse;
    try {
      aiResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ JSON parsing failed even after repair attempts:', parseError);
      console.error('🔍 Failed JSON sample:', jsonString.substring(0, 500));
      
      // Last resort: extract stems manually from response
      console.log('🛠️ Attempting manual stem extraction...');
      const stemMatches = response.match(/"stemText":\s*"([^"]+)"/g);
      if (stemMatches && stemMatches.length > 0) {
        const extractedStems = stemMatches.slice(0, validStemCount).map((match, index) => {
          const stemText = match.match(/"stemText":\s*"([^"]+)"/)?.[1] || `Concerning topic ${index + 1}`;
          return {
            id: `stem_${index + 1}`,
            stemText: stemText,
            orderIndex: index + 1,
            options: [
              {
                id: `option_${index + 1}_a`,
                optionLetter: 'A',
                statement: 'True',
                answer: true,
                explanation: 'Medical statement verified'
              },
              {
                id: `option_${index + 1}_b`,
                optionLetter: 'B',
                statement: 'False',
                answer: false,
                explanation: 'Medical statement corrected'
              }
            ]
          };
        });
        
        console.log(`🔧 Extracted ${extractedStems.length} stems from partial response`);
        return {
          stems: extractedStems,
          examType,
          topics,
          totalStems: extractedStems.length
        };
      }
      
      throw new Error('DeepSeek returned unparseable JSON format');
    }
    
    if (!aiResponse.stems || !Array.isArray(aiResponse.stems)) {
      throw new Error('DeepSeek response missing required stems array');
    }

    // Process DeepSeek AI generated stems
    const aiGeneratedStems = aiResponse.stems.slice(0, validStemCount).map((stem: any, index: number) => {
      return {
        id: stem.id || `stem_${index + 1}`,
        stemText: stem.stemText || `Concerning ${topics[index % topics.length]}`,
        orderIndex: index + 1,
        options: (stem.options || []).slice(0, 2).map((opt: any, optIndex: number) => ({
          id: opt.id || `option_${index + 1}_${optIndex === 0 ? 'a' : 'b'}`,
          optionLetter: opt.optionLetter || (optIndex === 0 ? 'A' : 'B'),
          statement: opt.statement || `Medical statement ${optIndex + 1}`,
          answer: opt.answer !== undefined ? opt.answer : (optIndex === 0),
          explanation: opt.explanation || `Medical explanation ${optIndex + 1}`
        }))
      };
    });

    console.log(`🎯 Successfully generated ${aiGeneratedStems.length} AI-powered medical exam stems from DeepSeek`);
    
    return {
      stems: aiGeneratedStems,
      examType,
      topics,
      totalStems: aiGeneratedStems.length
    };
  }

  // Case Study Analysis
  async analyzeCaseStudy(caseDetails: string): Promise<string> {
    const systemPrompt = `You are a clinical educator helping students analyze medical cases.
    
    FORMATTING REQUIREMENTS:
    - Use structured sections with medical emojis
    - Bold all medical terms and diagnoses
    - Include clinical reasoning emojis
    - End with learning summary
    
    Response Structure:
    🏥 **Clinical Case Analysis**
    
    📋 **Key Clinical Findings:**
    • [Finding 1 with **bold** terms]
    • [Finding 2 with **bold** terms]
    • [Finding 3 with **bold** terms]
    
    🤔 **Differential Diagnosis:**
    1. **[Primary diagnosis]** - [reasoning]
    2. **[Secondary diagnosis]** - [reasoning]
    3. **[Tertiary diagnosis]** - [reasoning]
    
    🔬 **Diagnostic Approach:**
    • **Initial tests:** [with **bold** test names]
    • **Confirmatory studies:** [with **bold** test names]
    • **Additional workup:** [if needed]
    
    💡 **Clinical Reasoning:**
    [Step-by-step thought process with **bold** key points]
    
    📚 **Learning Points:**
    • [Educational takeaway 1]
    • [Educational takeaway 2]
    • [Educational takeaway 3]
    
    ⭐ Excellent case for learning clinical reasoning!`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this case: ${caseDetails}` }
    ];

    return await this.generateResponse(messages, 0.6);
  }

  // Personalized Learning Recommendations
  async getPersonalizedRecommendations(weakAreas: string[], strengths: string[], learningStyle: string): Promise<any> {
    const systemPrompt = `You are a learning analytics expert for medical education. 
    Based on student performance data, provide personalized recommendations.
    
    Return JSON format:
    {
      "focusAreas": ["Area 1", "Area 2"],
      "studyStrategies": ["Strategy 1", "Strategy 2"],
      "recommendedResources": ["Resource 1", "Resource 2"],
      "practiceTopics": ["Topic 1", "Topic 2"],
      "timeAllocation": {
        "weakAreas": "60%",
        "review": "25%",
        "new_content": "15%"
      }
    }`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Weak areas: ${weakAreas.join(', ')}. Strengths: ${strengths.join(', ')}. Learning style: ${learningStyle}` }
    ];

    try {
      const response = await this.generateResponse(messages, 0.4);
      return JSON.parse(response);
    } catch (error) {
      console.error('Recommendations generation error:', error);
      return null;
    }
  }
}

export const openRouterAI = new OpenRouterAI();
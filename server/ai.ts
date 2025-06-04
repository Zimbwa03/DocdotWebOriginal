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
      console.warn('DEEPSEEK_API_KEY is not configured - AI features will be disabled');
      console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('API')));
    } else {
      console.log('AI service initialized successfully with caching');
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
      const timeoutId = setTimeout(() => controller.abort(), 20000); // Reduced to 20 seconds

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature,
          max_tokens: 1000, // Reduced from 2000 for faster responses
          stream: false,
          top_p: 0.9, // Add top_p for better performance
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', response.status, errorText);
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as any;
      const result = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
      
      // Cache the response
      this.setCache(cacheKey, result);
      
      return result;
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 20 seconds. Please try again with a shorter question.');
      }
      throw error;
    }
  }

  // Medical Question Generation
  async generateMedicalQuestions(topic: string, difficulty: string, count: number = 5): Promise<any[]> {
    const systemPrompt = `You are an expert medical educator. Generate ${count} True/False questions about ${topic} at ${difficulty} difficulty level.

    CRITICAL: You MUST respond with ONLY a valid JSON array. Do not include any text before or after the JSON.

    JSON Format (EXACT):
    [
      {
        "question": "Medical question about ${topic}",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "correct_answer": "True",
        "explanation": "Clear explanation of the answer",
        "category": "${topic}",
        "difficulty": "${difficulty}"
      }
    ]

    Requirements:
    - Medically accurate and evidence-based
    - Return ONLY the JSON array
    - No additional text or explanations outside the JSON`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate ${count} high-quality True/False medical questions about ${topic} for medical students` }
    ];

    try {
      const response = await this.generateResponse(messages, 0.2);
      
      // Clean the response to extract JSON if it's wrapped in text
      let jsonString = response.trim();
      
      // Look for JSON array in the response
      const jsonStart = jsonString.indexOf('[');
      const jsonEnd = jsonString.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      }
      
      const parsedResponse = JSON.parse(jsonString);
      
      // Ensure it's an array
      const questions = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      
      // Ensure correct format
      return questions.map((q: any) => ({
        ...q,
        options: ['True', 'False'],
        correctAnswer: q.correctAnswer || q.correct_answer,
        correct_answer: q.correctAnswer || q.correct_answer
      }));
    } catch (error) {
      console.error('Question generation error:', error);
      
      // Return fallback questions if parsing fails
      return Array.from({ length: count }, (_, i) => ({
        question: `Sample question ${i + 1} about ${topic}`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        correct_answer: 'True',
        explanation: `This is a sample explanation for ${topic}`,
        category: topic,
        difficulty: difficulty
      }));
    }
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
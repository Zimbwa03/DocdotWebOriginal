// Using Node.js built-in fetch (available in Node 18+)

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenRouterAI {
  private apiKey: string | null;

  constructor() {
    this.apiKey = OPENROUTER_API_KEY || null;
    if (!this.apiKey) {
      console.warn('OPENROUTER_API_KEY is not configured - AI features will be disabled');
    }
  }

  private checkApiKey(): boolean {
    if (!this.apiKey) {
      console.error('OpenRouter API key not configured');
      return false;
    }
    return true;
  }

  async generateResponse(messages: AIMessage[], temperature = 0.7): Promise<string> {
    if (!this.checkApiKey()) {
      throw new Error('AI service not available - API key not configured');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://docdot.app',
          'X-Title': 'Docdot Medical Learning Platform'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages,
          temperature,
          max_tokens: 1500,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as any;
      return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  // Medical Question Generation
  async generateMedicalQuestions(topic: string, difficulty: string, count: number = 5): Promise<any[]> {
    const systemPrompt = `You are an expert medical educator. Generate ${count} multiple-choice questions about ${topic} at ${difficulty} difficulty level. 
    Each question should be medically accurate and educational.
    
    Return ONLY a valid JSON array with this exact format:
    [
      {
        "question": "Question text here",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correctAnswer": "A) Option 1",
        "explanation": "Detailed explanation of why this is correct",
        "category": "${topic}",
        "difficulty": "${difficulty}"
      }
    ]`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate ${count} medical questions about ${topic}` }
    ];

    try {
      const response = await this.generateResponse(messages, 0.3);
      return JSON.parse(response);
    } catch (error) {
      console.error('Question generation error:', error);
      return [];
    }
  }

  // Medical Tutor Chat
  async tutorResponse(userQuestion: string, context?: string): Promise<string> {
    const systemPrompt = `You are an expert medical tutor with deep knowledge in anatomy, physiology, pathology, pharmacology, and clinical medicine. 
    Your goal is to help medical students learn effectively through clear explanations, examples, and educational guidance.
    
    Guidelines:
    - Provide accurate, evidence-based medical information
    - Use clear, educational language appropriate for medical students
    - Include relevant examples and mnemonics when helpful
    - Encourage critical thinking
    - Always emphasize the importance of clinical correlation
    - If unsure about specific clinical recommendations, advise consulting current medical literature
    
    ${context ? `Context: ${context}` : ''}`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuestion }
    ];

    return await this.generateResponse(messages, 0.7);
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
    const systemPrompt = `You are a medical educator explaining complex concepts clearly. 
    Explain the concept at ${level} level with:
    - Clear definition
    - Key points
    - Clinical relevance
    - Memory aids if applicable
    - Related concepts`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Explain: ${concept}` }
    ];

    return await this.generateResponse(messages, 0.6);
  }

  // Case Study Analysis
  async analyzeCaseStudy(caseDetails: string): Promise<string> {
    const systemPrompt = `You are a clinical educator helping students analyze medical cases.
    Provide a structured analysis including:
    - Key clinical findings
    - Differential diagnosis considerations
    - Diagnostic approach
    - Educational learning points
    - Clinical reasoning process`;

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
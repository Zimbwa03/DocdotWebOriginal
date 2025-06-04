// Using Node.js built-in fetch (available in Node 18+)

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/chat/completions';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenRouterAI {
  private apiKey: string | null;

  constructor() {
    this.apiKey = DEEPSEEK_API_KEY || null;
    if (!this.apiKey) {
      console.warn('DEEPSEEK_API_KEY is not configured - AI features will be disabled');
      console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('API')));
    } else {
      console.log('AI service initialized successfully');
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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

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
          max_tokens: 2000,
          stream: false
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
    const systemPrompt = `You are an expert medical educator and board exam specialist. Generate ${count} True/False questions about ${topic} at ${difficulty} difficulty level. 
    
    Requirements:
    - Each question should be medically accurate and evidence-based
    - Use current medical knowledge and guidelines
    - Include clinical scenarios when appropriate
    - Provide detailed explanations for both correct and incorrect answers
    - Make questions challenging but fair for medical students
    
    Return ONLY a valid JSON array with this exact format:
    [
      {
        "question": "Clear, specific question statement about ${topic}",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "correct_answer": "True",
        "explanation": "Comprehensive explanation of why the answer is correct, including relevant medical facts and clinical significance",
        "category": "${topic}",
        "difficulty": "${difficulty}"
      }
    ]
    
    Ensure all medical terminology is accurate and explanations include:
    - Physiological/anatomical basis
    - Clinical significance
    - Related concepts or conditions`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate ${count} high-quality True/False medical questions about ${topic} for medical students` }
    ];

    try {
      const response = await this.generateResponse(messages, 0.2);
      const parsedResponse = JSON.parse(response);
      
      // Ensure correct format
      return parsedResponse.map((q: any) => ({
        ...q,
        options: ['True', 'False'],
        correctAnswer: q.correctAnswer || q.correct_answer,
        correct_answer: q.correctAnswer || q.correct_answer
      }));
    } catch (error) {
      console.error('Question generation error:', error);
      return [];
    }
  }

  // Medical Tutor Chat
  async tutorResponse(userQuestion: string, context?: string): Promise<string> {
    const systemPrompt = `You are an expert medical tutor 👨‍⚕️ with deep knowledge in anatomy, physiology, pathology, pharmacology, and clinical medicine. 
    Your goal is to help medical students learn effectively through clear explanations, examples, and educational guidance.
    
    CRITICAL FORMATTING RULES:
    - Always start responses with an appropriate emoji and greeting
    - Use **bold text** for key medical terms (the frontend will render this properly)
    - Structure responses with clear sections using emojis as headers
    - Include bullet points with relevant emojis
    - End with encouraging emojis and call-to-action
    - Use clinical correlation emojis 🏥 for practical applications
    - Include study tip emojis 📚 for learning strategies
    
    Content Guidelines:
    - Provide accurate, evidence-based medical information
    - Use clear, educational language appropriate for medical students
    - Include relevant examples and mnemonics when helpful
    - Encourage critical thinking with 💭 thoughtful questions
    - Always emphasize the importance of clinical correlation 🏥
    - Add encouraging phrases like "Great question!" or "You're on the right track!"
    - If unsure about specific clinical recommendations, advise consulting current medical literature
    
    Response Structure Template:
    [Greeting Emoji] Great question! [Topic Emoji]
    
    📖 **Definition/Overview:**
    [Clear explanation with **bold** key terms]
    
    🔍 **Key Points:**
    • [Point 1 with **bold** terms]
    • [Point 2 with **bold** terms]
    
    🏥 **Clinical Relevance:**
    [Practical applications]
    
    📚 **Study Tips:**
    [Memory aids or study strategies]
    
    💭 **Think About This:**
    [Thought-provoking question]
    
    ✨ Keep up the excellent work! Any follow-up questions?
    
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
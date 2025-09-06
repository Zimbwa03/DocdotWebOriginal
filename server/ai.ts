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

  // Histopathology MCQ Generation with Robbins References
  async generateHistopathologyMCQs(topic: string, subtopics: string[], count: number = 5): Promise<any[]> {
    if (!this.checkApiKey()) {
      throw new Error('AI service not available - API key not configured');
    }

    // Validate inputs
    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic is required');
    }

    const sanitizedTopic = topic.trim();
    const validCount = Math.min(Math.max(count, 1), 20); // Limit to 20 MCQs
    const subtopicsList = subtopics.length > 0 ? subtopics.join(', ') : sanitizedTopic;

    const systemPrompt = `You are an expert pathologist and medical educator creating high-quality True/False questions for medical students studying histopathology.

    CRITICAL REQUIREMENTS:
    1. Generate EXACTLY ${validCount} True/False questions about "${sanitizedTopic}"
    2. Focus on these subtopics: ${subtopicsList}
    3. Use latest DeepSeek AI knowledge and current medical standards
    4. Each question MUST be True/False format only
    5. Respond with ONLY a valid JSON array - no extra text, no markdown, no explanations
    
    Answer Format Requirements:
    - correctAnswer: "True" or "False" only
    - shortExplanation: Brief 1-2 sentence explanation
    - detailedExplanation: Comprehensive 3-4 sentence explanation with mechanisms
    - robbinsReference: "Robbins Basic Pathology, Chapter [X], Page [Y-Z]" format

    JSON Format (EXACT - NO OTHER TEXT):
    [
      {
        "question": "Atherosclerotic plaque rupture with thrombosis is the most common cause of acute myocardial infarction",
        "correctAnswer": "True",
        "shortExplanation": "Atherosclerotic plaque rupture with subsequent thrombosis accounts for over 90% of acute myocardial infarctions.",
        "detailedExplanation": "Acute myocardial infarction most commonly results from rupture of an atherosclerotic plaque in a coronary artery, leading to platelet aggregation and thrombus formation. This process occludes the coronary artery, causing ischemic necrosis of the myocardium supplied by that vessel. The vulnerable plaques typically have a thin fibrous cap overlying a large lipid core with abundant inflammatory cells.",
        "robbinsReference": "Robbins Basic Pathology, Chapter 12, Page 387-395",
        "topic": "${sanitizedTopic}",
        "subtopic": "Ischemic heart disease"
      }
    ]

    Question Quality Standards:
    - Questions must be True/False format only
    - Test UNDERSTANDING, not just memorization
    - Include clinically relevant scenarios when appropriate
    - Use current pathological classification systems
    - Make statements clearly true or clearly false (avoid ambiguous wording)
    - Reference standard textbook: Robbins Basic Pathology (10th Edition)
    - Include specific chapter and page numbers in robbinsReference
    - Questions should span different subtopics within the main topic
    - Vary difficulty from basic concepts to advanced pathophysiology
    - Use proper medical terminology and current nomenclature
    
    Return ONLY the JSON array - no other text or formatting.`;

    const userPrompt = `Generate ${validCount} high-quality histopathology MCQs about "${sanitizedTopic}" covering these subtopics: ${subtopicsList}. Ensure each question tests understanding of pathological processes, mechanisms, and clinical correlations.`;

    try {
      console.log(`🧠 Generating ${validCount} histopathology MCQs for topic: ${sanitizedTopic}`);
      
      const response = await this.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], 0.7);

      // Parse the JSON response
      let questions;
      try {
        // Remove any markdown formatting if present
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        questions = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.error('Raw response:', response);
        throw new Error('Invalid JSON response from AI service');
      }

      // Validate response structure
      if (!Array.isArray(questions)) {
        throw new Error('AI response is not an array');
      }

      if (questions.length === 0) {
        throw new Error('AI returned empty questions array');
      }

      // Validate each question structure
      const validatedQuestions = questions.map((q, index) => {
        if (!q.question || !q.correctAnswer || !q.shortExplanation || !q.detailedExplanation || !q.robbinsReference) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }

        if (!['True', 'False'].includes(q.correctAnswer)) {
          throw new Error(`Question ${index + 1} has invalid correct answer: ${q.correctAnswer}. Must be "True" or "False"`);
        }

        return {
          ...q,
          topic: sanitizedTopic,
          subtopic: q.subtopic || subtopics[Math.floor(Math.random() * subtopics.length)] || sanitizedTopic,
          generatedAt: new Date().toISOString(),
          difficulty: 'intermediate'
        };
      });

      console.log(`✅ Successfully generated ${validatedQuestions.length} histopathology MCQs`);
      return validatedQuestions;

    } catch (error: any) {
      console.error('Error generating histopathology MCQs:', error);
      
      // If AI fails, provide educational fallback
      if (error.message?.includes('API key') || error.message?.includes('not configured')) {
        throw error;
      }

      console.log('Providing fallback histopathology MCQ due to AI error');
      return this.generateHistopathologyFallback(sanitizedTopic, subtopics, validCount);
    }
  }

  // Fallback histopathology True/False questions when AI fails
  private generateHistopathologyFallback(topic: string, subtopics: string[], count: number): any[] {
    const fallbackQuestions = [
      {
        question: "Acute inflammation is characterized by vascular dilation and increased permeability",
        correctAnswer: "True",
        shortExplanation: "Acute inflammation is primarily characterized by vascular changes including dilation and increased permeability.",
        detailedExplanation: "Acute inflammation involves immediate vascular responses to injury, including arteriolar dilation and increased capillary permeability. These changes allow plasma proteins and inflammatory cells to enter tissues, resulting in the classic signs of inflammation: redness, heat, swelling, pain, and loss of function.",
        robbinsReference: "Robbins Basic Pathology, Chapter 3, Page 78-85",
        topic: topic,
        subtopic: subtopics[0] || topic
      },
      {
        question: "Apoptosis always causes inflammatory responses in surrounding tissues",
        correctAnswer: "False",
        shortExplanation: "Apoptosis is programmed cell death that does not cause inflammation, unlike necrosis.",
        detailedExplanation: "Apoptosis is a controlled process of programmed cell death that affects individual cells without causing inflammation. In contrast, necrosis is uncontrolled cell death usually affecting groups of cells due to injury, hypoxia, or toxins, and it triggers inflammatory responses. Apoptotic cells are quickly phagocytosed by neighboring cells or macrophages.",
        robbinsReference: "Robbins Basic Pathology, Chapter 2, Page 45-52",
        topic: topic,
        subtopic: subtopics[1] || topic
      },
      {
        question: "Hypertrophy involves an increase in both cell size and cell number",
        correctAnswer: "False",
        shortExplanation: "Hypertrophy involves increased cell size only, while hyperplasia involves increased cell number.",
        detailedExplanation: "Hypertrophy is the increase in cell size and organ size due to increased synthesis of cellular components, without an increase in cell number. This commonly occurs in muscle cells that cannot divide, such as cardiac myocytes in response to increased workload. Hyperplasia, in contrast, involves an increase in cell number.",
        robbinsReference: "Robbins Basic Pathology, Chapter 2, Page 32-38",
        topic: topic,
        subtopic: subtopics[2] || topic
      }
    ];

    // Return only the requested number of questions
    return fallbackQuestions.slice(0, count).map((q, index) => ({
      ...q,
      generatedAt: new Date().toISOString(),
      difficulty: 'intermediate',
      fallback: true
    }));
  }

  // Medical Question Generation (existing True/False format)
  async generateMedicalQuestions(topic: string, difficulty: string, count: number = 5): Promise<any[]> {
    if (!this.checkApiKey()) {
      throw new Error('AI service not available - API key not configured');
    }

    // Validate inputs
    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic is required');
    }

    const sanitizedTopic = topic.trim();
    const validCount = Math.min(Math.max(count, 1), 50); // Allow up to 50 questions

    const systemPrompt = `You are an expert medical educator and DeepSeek AI assistant creating high-quality True/False questions for medical students.

    CRITICAL REQUIREMENTS:
    1. Generate EXACTLY ${validCount} True/False questions about "${sanitizedTopic}"
    2. Difficulty level: ${difficulty}
    3. Respond with ONLY a valid JSON array - no extra text, no markdown, no explanations
    4. Each question must be medically accurate, evidence-based, and educationally valuable
    5. Questions should test understanding, not just memorization

    JSON Format (EXACT - NO OTHER TEXT):
    [
      {
        "question": "The heart has four chambers",
        "correctAnswer": "True",
        "explanation": "The heart consists of two atria and two ventricles, making four chambers total",
        "detailedExplanation": "The human heart is a four-chambered organ consisting of two atria (upper chambers) and two ventricles (lower chambers). The right atrium receives deoxygenated blood from the body, the right ventricle pumps it to the lungs, the left atrium receives oxygenated blood from the lungs, and the left ventricle pumps it to the body. This four-chamber structure is essential for the double circulation system.",
        "reference": "Snell's Clinical Anatomy by Regions, 10th Edition, Chapter 3: Thorax, Page 145-150",
        "category": "${sanitizedTopic}",
        "difficulty": "${difficulty}"
      }
    ]

    Question Quality Standards:
    - Questions must be True/False only
    - Include clear, educational explanations (2-3 sentences for 'explanation')
    - Include detailed explanations (4-6 sentences for 'detailedExplanation')
    - Add proper book references with specific chapters and page numbers
    - Use proper medical terminology
    - Test conceptual understanding, not just facts
    - Vary question complexity based on difficulty level
    - Ensure questions are clinically relevant
    - References should include: Snell's Clinical Anatomy, Gray's Anatomy, Moore's Clinical Anatomy, or similar authoritative texts
    - Return ONLY the JSON array - no other text`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate ${validCount} medical True/False questions about "${sanitizedTopic}" at ${difficulty} level for medical students. Focus on clinically relevant concepts and ensure educational value. Return only valid JSON array.` }
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

      // Remove common prefixes/suffixes that AI might add
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      jsonString = jsonString.replace(/^Here are the questions:\s*/i, '');
      jsonString = jsonString.replace(/^Generated questions:\s*/i, '');
      jsonString = jsonString.replace(/^Questions:\s*/i, '');

      // Find JSON array bounds
      const jsonStart = jsonString.indexOf('[');
      const jsonEnd = jsonString.lastIndexOf(']');

      if (jsonStart === -1 || jsonEnd === -1) {
        console.error('No JSON array found. Response:', response.substring(0, 500));
        throw new Error('No valid JSON array found in AI response. The AI may have provided text instead of JSON.');
      }

      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      
      // Additional cleaning for common AI response issues
      jsonString = jsonString.replace(/\n\s*/g, ' '); // Remove newlines and extra spaces
      jsonString = jsonString.replace(/\s+/g, ' '); // Normalize spaces

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonString);
              } catch (parseError: any) {
        console.error('JSON parsing failed:', parseError);
        console.error('Failed JSON string:', jsonString);
        console.error('Original response:', response.substring(0, 1000));
        
        // Try to fix common JSON issues
        try {
          // Fix common AI response issues
          let fixedJson = jsonString
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
            .replace(/:(\s*)([^",{\[\s][^,}\]]*?)(\s*[,}])/g, ': "$2"$3'); // Add quotes to unquoted string values
          
          parsedResponse = JSON.parse(fixedJson);
          console.log('Successfully parsed after fixing common issues');
        } catch (secondError) {
          throw new Error(`Invalid JSON format in AI response. Parse error: ${parseError.message}`);
        }
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
          detailedExplanation: q.detailedExplanation || q.detailed_explanation || q.explanation || `Detailed explanation for question about ${sanitizedTopic}`,
          reference: q.reference || `Reference for ${sanitizedTopic} question`,
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

    const systemPrompt = `You are a medical education expert creating professional ${examType} exam stems based on authoritative medical sources.

AUTHORITATIVE SOURCES TO REFERENCE:
For Anatomy:
- Snell's Clinical Anatomy (Richard S. Snell)
- Gray's Anatomy for Students (Drake, Vogl, Mitchell)
- Clinically Oriented Anatomy (Keith L. Moore)
- TeachMeAnatomy.info educational content
- Kenhub.com anatomy resources

For Physiology:
- Guyton and Hall Textbook of Medical Physiology
- Ganong's Review of Medical Physiology
- Boron & Boulpaep Medical Physiology
- TeachMePhysiology.com educational content
- Kenhub.com physiology resources

Generate ${validStemCount} exam stems for: ${topics.join(', ')}

CONTENT REQUIREMENTS:
- Base all facts on the authoritative sources listed above
- For ANATOMY regional topics, include diverse subtopics:
  * If "thorax": cover ribs, sternum, thoracic vertebrae, intercostal spaces, pleura, lungs, heart, mediastinum, diaphragm, pericardium
  * If "upper limb": cover bones, joints, muscles, nerves (brachial plexus), vessels, fascial compartments, clinical correlations
  * If "lower limb": cover bones, joints, muscles, nerves (lumbar/sacral plexus), vessels, fascial compartments, arches of foot
  * If "head & neck": cover skull, cervical vertebrae, muscles, cranial nerves, vessels, organs, triangles of neck
  * If "abdomen": cover peritoneum, organs, vessels, muscles, inguinal region, posterior abdominal wall
  * If "pelvis": cover bones, joints, muscles, organs, vessels, pelvic floor, perineum

- For PHYSIOLOGY system topics, include diverse subtopics:
  * If "cardiovascular": cover cardiac cycle, ECG, blood pressure regulation, heart sounds, circulation pathways
  * If "respiratory": cover ventilation mechanics, gas exchange, oxygen transport, acid-base balance, control of breathing
  * If "renal": cover filtration, reabsorption, secretion, acid-base regulation, fluid balance, hormonal control
  * If "nervous": cover action potentials, synaptic transmission, reflexes, CNS functions, autonomic nervous system
  * If "endocrine": cover hormone mechanisms, feedback loops, specific gland functions, metabolic regulation
  * If "gastrointestinal": cover motility, secretion, digestion, absorption, liver functions, pancreatic functions

- Each stem should test different concepts within the topic area
- Include clinically relevant relationships and correlations
- Reference standard terminology (Terminologia Anatomica for anatomy)

FORMAT: Each stem follows "Concerning the [specific anatomical aspect]" with 2 true/false options.

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
          "explanation": "According to Snell's Clinical Anatomy, clavicle fractures are indeed the most common upper limb fracture in falls"
        },
        {
          "id": "option_1_b",
          "optionLetter": "B",
          "statement": "The radius is located medial to the ulna",
          "answer": false,
          "explanation": "As described in Gray's Anatomy, the radius is lateral to the ulna in the standard anatomical position"
        }
      ]
    }
  ]
}

Generate ${validStemCount} medically accurate stems from authoritative sources. Ensure diverse subtopic coverage. Return ONLY valid JSON.`;

    const userPrompt = `Generate ${validStemCount} medical exam stems about ${examType} covering: ${topics.join(', ')}.

CRITICAL: Each stem must follow this EXACT format:
- Start with "Concerning [specific topic]"
- Have exactly 5 statements labeled a, b, c, d, e
- Mix true and false statements
- Include detailed explanations citing medical sources
- Use proper medical terminology

Example topics for ${examType}:
${examType === 'anatomy' ? 
  '- "Concerning the muscles of the forearm"\n- "Concerning the blood supply to the brain"\n- "Concerning the joints of the lower limb"' :
  '- "Concerning cardiac electrophysiology"\n- "Concerning renal filtration"\n- "Concerning respiratory mechanics"'}

Return ONLY valid JSON in the specified format. No additional text.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      console.log(`🤖 Sending request to DeepSeek for ${validStemCount} stems`);
      const response = await this.generateResponse(messages, 0.7);

      console.log(`✅ DeepSeek response received, length: ${response.length}`);

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const examData = JSON.parse(jsonMatch[0]);

      if (!examData.stems || !Array.isArray(examData.stems)) {
        throw new Error('Invalid exam data structure from AI');
      }

      // Validate each stem has proper format
      examData.stems.forEach((stem: any, index: number) => {
        if (!stem.stemText || !stem.stemText.startsWith('Concerning')) {
          throw new Error(`Stem ${index + 1} missing proper "Concerning" format`);
        }
        if (!stem.options || stem.options.length !== 5) {
          throw new Error(`Stem ${index + 1} must have exactly 5 options (a-e)`);
        }

        // Ensure proper option letters
        const expectedLetters = ['a', 'b', 'c', 'd', 'e'];
        stem.options.forEach((option: any, optIndex: number) => {
          if (option.optionLetter !== expectedLetters[optIndex]) {
            option.optionLetter = expectedLetters[optIndex];
          }
        });
      });

      console.log(`✅ Successfully parsed and validated ${examData.stems.length} stems from AI`);
      return examData;

    } catch (error: any) {
      console.error('❌ DeepSeek AI generation failed:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
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
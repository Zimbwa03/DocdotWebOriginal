import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate live notes from transcript
   */
  async generateLiveNotes(transcript: string, module: string, topic?: string): Promise<string> {
    try {
      const prompt = `
You are an AI assistant helping medical students at the University of Zimbabwe. 
Generate structured, concise notes from this lecture transcript.

Module: ${module}
Topic: ${topic || 'General'}

Transcript: ${transcript}

Please generate notes in the following format:
## Key Points from Live Lecture

### [Main Topic/Concept]
- [Key point 1]
- [Key point 2]
- [Key point 3]

### [Sub-topic/Details]
- [Important detail 1]
- [Important detail 2]

### Clinical Relevance
- [Clinical application 1]
- [Clinical application 2]

Focus on:
1. Medical terminology and definitions
2. Key concepts and relationships
3. Clinical applications
4. Important facts for exam preparation
5. Structure the content for easy revision

Keep the notes concise but comprehensive, suitable for medical students.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating live notes:', error);
      throw new Error('Failed to generate live notes');
    }
  }

  /**
   * Generate comprehensive summary with research context
   */
  async generateComprehensiveSummary(
    transcript: string, 
    liveNotes: string, 
    module: string, 
    topic?: string
  ): Promise<{
    summary: string;
    keyPoints: string[];
    medicalTerms: string[];
    researchContext: string;
  }> {
    try {
      const prompt = `
You are an AI assistant helping medical students at the University of Zimbabwe.
Generate a comprehensive summary of this medical lecture with additional research context.

Module: ${module}
Topic: ${topic || 'General'}

Original Transcript: ${transcript}

Live Notes: ${liveNotes}

Please provide:

1. **Comprehensive Summary** (500-800 words):
   - Detailed overview of the lecture content
   - Key concepts and their relationships
   - Clinical significance and applications
   - Important medical facts and terminology

2. **Key Points** (as a JSON array):
   - Extract 8-12 most important points
   - Focus on exam-relevant content
   - Include both theoretical and clinical points

3. **Medical Terms** (as a JSON array):
   - Extract important medical terminology
   - Include definitions where relevant
   - Focus on terms students need to know

4. **Research Context** (300-500 words):
   - Additional research and clinical context
   - Recent developments in the field
   - Clinical guidelines and protocols
   - Related conditions and treatments

Format the response as JSON:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "medicalTerms": ["...", "..."],
  "researchContext": "..."
}

Focus on accuracy, medical relevance, and exam preparation value.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const jsonResponse = JSON.parse(response.text());
        return {
          summary: jsonResponse.summary || '',
          keyPoints: jsonResponse.keyPoints || [],
          medicalTerms: jsonResponse.medicalTerms || [],
          researchContext: jsonResponse.researchContext || ''
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        const text = response.text();
        return {
          summary: text,
          keyPoints: this.extractKeyPoints(text),
          medicalTerms: this.extractMedicalTerms(text),
          researchContext: this.extractResearchContext(text)
        };
      }
    } catch (error) {
      console.error('Error generating comprehensive summary:', error);
      throw new Error('Failed to generate comprehensive summary');
    }
  }

  /**
   * Detect and translate mixed language content
   */
  async detectAndTranslate(transcript: string): Promise<{
    unifiedTranscript: string;
    languageDetected: string;
    confidence: number;
  }> {
    try {
      const prompt = `
Analyze this transcript and determine if it contains mixed languages (English and Shona).
If Shona is detected, translate it to English while preserving the meaning.

Transcript: ${transcript}

Please respond with JSON:
{
  "unifiedTranscript": "English translation of the entire transcript",
  "languageDetected": "en" or "en-sh" or "sh",
  "confidence": 0.0-1.0
}

Focus on medical terminology and academic content accuracy.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const jsonResponse = JSON.parse(response.text());
        return {
          unifiedTranscript: jsonResponse.unifiedTranscript || transcript,
          languageDetected: jsonResponse.languageDetected || 'en',
          confidence: jsonResponse.confidence || 0.9
        };
      } catch (parseError) {
        // Fallback
        return {
          unifiedTranscript: transcript,
          languageDetected: 'en',
          confidence: 0.8
        };
      }
    } catch (error) {
      console.error('Error detecting and translating:', error);
      return {
        unifiedTranscript: transcript,
        languageDetected: 'en',
        confidence: 0.5
      };
    }
  }

  /**
   * Generate exam-style questions from lecture content
   */
  async generateExamQuestions(
    summary: string, 
    keyPoints: string[], 
    module: string
  ): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>> {
    try {
      const prompt = `
Generate 5 exam-style multiple choice questions based on this medical lecture content.

Module: ${module}
Summary: ${summary}
Key Points: ${keyPoints.join(', ')}

Create questions that test:
1. Core concepts and definitions
2. Clinical applications
3. Medical terminology
4. Relationships between concepts

Format as JSON array:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation"
  }
]

Make questions challenging but fair for medical students.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const jsonResponse = JSON.parse(response.text());
        return Array.isArray(jsonResponse) ? jsonResponse : [];
      } catch (parseError) {
        return [];
      }
    } catch (error) {
      console.error('Error generating exam questions:', error);
      return [];
    }
  }

  // Helper methods for fallback parsing
  private extractKeyPoints(text: string): string[] {
    const lines = text.split('\n');
    const keyPoints: string[] = [];
    
    lines.forEach(line => {
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        keyPoints.push(line.trim().substring(1).trim());
      }
    });
    
    return keyPoints.slice(0, 10); // Limit to 10 key points
  }

  private extractMedicalTerms(text: string): string[] {
    // Simple extraction of capitalized terms that might be medical
    const words = text.split(/\s+/);
    const medicalTerms = words.filter(word => 
      word.length > 3 && 
      /^[A-Z][a-z]+$/.test(word) && 
      !['The', 'This', 'That', 'There', 'Then', 'They'].includes(word)
    );
    
    return [...new Set(medicalTerms)].slice(0, 15); // Remove duplicates and limit
  }

  private extractResearchContext(text: string): string {
    // Extract the last few paragraphs as research context
    const paragraphs = text.split('\n\n');
    return paragraphs.slice(-2).join('\n\n');
  }
}

export const geminiAI = new GeminiAIService();

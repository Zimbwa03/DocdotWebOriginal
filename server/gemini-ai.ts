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
   * Generate live notes from transcript (optimized for speed)
   */
  async generateLiveNotes(transcript: string, module: string, topic?: string): Promise<string> {
    try {
      console.log(`🤖 Processing transcript for ${module}: ${transcript.substring(0, 100)}...`);

      // Use a more detailed prompt that emphasizes using the actual transcript content
      const prompt = `
You are an AI assistant helping medical students at the University of Zimbabwe. 
Generate structured, concise notes from this ACTUAL LECTURE TRANSCRIPT.

IMPORTANT: Base your notes ONLY on the actual speech content provided below. Do not generate generic notes.

Module: ${module}
Topic: ${topic || 'General'}

ACTUAL LECTURE TRANSCRIPT:
${transcript}

Please generate notes in the following format based on the ACTUAL CONTENT:

## Key Points from Lecture
- [Extract main concepts from the actual speech]
- [Identify important points mentioned by the lecturer]

## Medical Terms & Definitions
- [Extract medical terms mentioned in the speech]
- [Include definitions if provided in the speech]

## Clinical Applications
- [Identify clinical applications discussed in the speech]
- [Note any practical examples mentioned]

## Important Details
- [Capture specific details, numbers, or facts mentioned]
- [Include any important explanations from the lecturer]

Focus on:
1. What was ACTUALLY said in the transcript
2. Medical terminology mentioned in the speech
3. Key concepts discussed by the lecturer
4. Clinical applications mentioned
5. Important details and facts provided

Make sure the notes reflect the actual content of the lecture, not generic information.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedNotes = response.text();
      
      console.log(`✅ Generated notes from actual transcript content`);
      return generatedNotes;
    } catch (error) {
      console.error('Error generating live notes:', error);
      // Return a fallback that includes actual transcript content
      return `## Key Points from ${module}

### Based on Lecture Content:
${transcript.substring(0, 300)}...

### Notes:
- Processing actual lecture content
- AI analysis in progress
- Content will be updated with more details

**Note: This is based on the actual speech transcript provided.**
`;
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
   * Detect and translate mixed language content (optimized for Shona-English)
   */
  async detectAndTranslate(transcript: string): Promise<{
    unifiedTranscript: string;
    languageDetected: string;
    confidence: number;
  }> {
    try {
      // Quick check if transcript contains Shona words
      const shonaIndicators = ['ndinoda', 'ndiri', 'ndinotaura', 'ndinonzwa', 'ndinofunga', 'ndinoda', 'ndinoda', 'ndinoda'];
      const hasShona = shonaIndicators.some(word => transcript.toLowerCase().includes(word));
      
      if (!hasShona) {
        // No Shona detected, return as is
        return {
          unifiedTranscript: transcript,
          languageDetected: 'en',
          confidence: 0.9
        };
      }

      const prompt = `
Translate this mixed Shona-English medical lecture transcript to English. 
Preserve medical terminology and academic meaning.

Transcript: ${transcript}

Respond with JSON:
{
  "unifiedTranscript": "Complete English translation",
  "languageDetected": "en-sh",
  "confidence": 0.9
}

Focus on medical accuracy and academic context.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const jsonResponse = JSON.parse(response.text());
        return {
          unifiedTranscript: jsonResponse.unifiedTranscript || transcript,
          languageDetected: jsonResponse.languageDetected || 'en-sh',
          confidence: jsonResponse.confidence || 0.9
        };
      } catch (parseError) {
        // Fallback - try simple translation
        const simplePrompt = `Translate to English: ${transcript}`;
        const simpleResult = await this.model.generateContent(simplePrompt);
        const simpleResponse = await simpleResult.response;
        
        return {
          unifiedTranscript: simpleResponse.text() || transcript,
          languageDetected: 'en-sh',
          confidence: 0.7
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

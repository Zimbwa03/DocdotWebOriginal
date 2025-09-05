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
   * Generate comprehensive notes for manual generation with enhanced research integration
   */
  async generateComprehensiveNotes(transcript: string, module: string, topic?: string): Promise<string> {
    try {
      console.log(`🤖 Generating comprehensive notes for ${module}: ${transcript.length} characters`);

      const prompt = `
You are an expert medical education assistant for University of Zimbabwe students. 
Generate comprehensive, well-researched, and highly structured lecture notes from this medical lecture transcript.

IMPORTANT: This is a complete lecture transcript. Create detailed, exam-ready notes that will help medical students excel in their studies.

Module: ${module}
Topic: ${topic || 'General Medical Concepts'}

COMPLETE LECTURE TRANSCRIPT:
${transcript}

Create detailed, structured notes that include:

# ${module} - ${topic || 'Comprehensive Lecture Notes'}

## 🎯 Learning Objectives
- [Extract and list the main learning objectives from the lecture]
- [Key skills and knowledge students should gain]
- [What students should be able to do after studying these notes]

## 📚 Core Concepts & Definitions
- [Important medical terms and definitions mentioned in the lecture]
- [Key concepts explained by the lecturer with clear explanations]
- [Fundamental principles discussed]
- [Essential knowledge for medical practice]

## 🔬 Detailed Content Analysis
- [Main topics covered in detail during the lecture]
- [Important explanations, examples, and case studies given]
- [Step-by-step processes or procedures explained]
- [Mechanisms and pathophysiology discussed]

## 🏥 Clinical Applications
- [Practical applications discussed in the lecture]
- [Clinical relevance and real-world examples]
- [How concepts apply to medical practice]
- [Diagnostic and treatment implications]

## 📖 Medical Terminology & Definitions
- [All medical terms mentioned with clear definitions]
- [Important abbreviations and their meanings]
- [Technical language explained in simple terms]
- [Etymology and word roots where relevant]

## 🔍 Research & Additional Context
- [Add relevant medical research and current context]
- [Important facts, statistics, and data mentioned]
- [Current medical practices, guidelines, and standards]
- [Recent developments in the field]
- [Evidence-based medicine references]

## 📊 Key Information Tables
- [Create tables for comparisons, classifications, or lists]
- [Organize complex information in easy-to-read formats]
- [Differential diagnoses, drug dosages, normal values]

## ⚠️ Important Points to Remember
- [Critical information for exams and clinical practice]
- [Common mistakes or misconceptions to avoid]
- [Key facts that are frequently tested]
- [Red flags and warning signs]

## 📝 Summary & Key Takeaways
- [Main points to remember for exams]
- [Critical information for medical practice]
- [Action items for further study]
- [Quick reference summary]

## 🔗 Related Topics & Further Reading
- [Topics mentioned that relate to other medical subjects]
- [Suggestions for additional study materials]
- [Cross-references to other body systems]

## 📝 Exam Questions
- [Generate 5 authentic exam questions based on this specific lecture content]
- [Questions should test knowledge actually covered in this lecture]
- [Include clinical scenarios and specific details mentioned]

## 🎓 Study Tips
- [Effective study strategies for this topic]
- [Memory aids and mnemonics]
- [Common exam patterns and question types]

Format the notes professionally with:
- Clear headings and subheadings
- Bullet points and numbered lists
- Tables for organized information
- Bold text for important terms
- Emojis for visual organization
- Professional medical writing style
- Proper medical terminology usage

Focus on:
1. Exam preparation and clinical relevance
2. Clear, concise explanations
3. Well-organized structure
4. Comprehensive coverage of all topics mentioned
5. Additional research context where helpful
6. Practical applications for medical students
7. Integration with current medical knowledge
8. Evidence-based information

Make these notes the best possible study resource for University of Zimbabwe medical students.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let generatedNotes = response.text();
      
      // Generate authentic exam questions and append them
      try {
        const examQuestions = await this.generateAuthenticExamQuestions(transcript, module, topic);
        if (examQuestions.length > 0) {
          generatedNotes += '\n\n## 📝 Exam Questions\n\n';
          generatedNotes += examQuestions.join('\n\n');
        }
      } catch (error) {
        console.error('Error adding exam questions:', error);
        generatedNotes += '\n\n## 📝 Exam Questions\n\n*Error generating exam questions. Please try again.*';
      }
      
      console.log(`✅ Generated comprehensive notes with exam questions: ${generatedNotes.length} characters`);
      return generatedNotes;
    } catch (error) {
      console.error('Error generating comprehensive notes:', error);
      return `# ${module} - ${topic || 'Lecture Notes'}

## Transcript Summary
${transcript.substring(0, 500)}...

## Error Note
*AI processing encountered an error. Please try generating notes again.*

## Manual Notes
Please review the transcript above and create your own structured notes based on the lecture content.
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
   * Generate authentic exam questions from specific lecture transcript
   */
  async generateAuthenticExamQuestions(transcript: string, module: string, topic?: string): Promise<string[]> {
    try {
      console.log(`🎯 Generating authentic exam questions for ${module}: ${transcript.length} characters`);

      const prompt = `
You are a medical education expert creating authentic, high-quality exam questions for University of Zimbabwe medical students.

IMPORTANT: Generate questions based ONLY on the specific content discussed in this actual lecture transcript. Do NOT create generic questions.

Module: ${module}
Topic: ${topic || 'General'}

ACTUAL LECTURE TRANSCRIPT:
${transcript}

Create 5 authentic, exam-quality questions that:

1. **Based on Specific Lecture Content**: Questions must be directly related to what was actually discussed in this lecture
2. **Medical School Level**: Appropriate difficulty for medical students
3. **Clinical Relevance**: Include real clinical scenarios when possible
4. **Specific Details**: Reference specific facts, numbers, or concepts mentioned in the lecture
5. **Exam Format**: Multiple choice with 4 options (A, B, C, D)

For each question, provide:
- **Question**: Clear, specific question based on lecture content
- **Options**: 4 plausible multiple choice options (A, B, C, D)
- **Correct Answer**: The correct option with letter
- **Explanation**: Detailed explanation referencing specific lecture content

Format as JSON array:
[
  {
    "question": "Based on the lecture, what specific mechanism was discussed for...?",
    "options": {
      "A": "Option 1 (specific to lecture)",
      "B": "Option 2 (specific to lecture)", 
      "C": "Option 3 (specific to lecture)",
      "D": "Option 4 (specific to lecture)"
    },
    "correctAnswer": "A",
    "explanation": "As mentioned in the lecture, the lecturer specifically stated that... [reference actual lecture content]"
  }
]

Focus on:
- Specific facts mentioned in the lecture
- Clinical examples discussed
- Medical terminology used
- Procedures or processes explained
- Important details or statistics mentioned
- Case studies or examples given

Make sure each question tests knowledge that was actually covered in this specific lecture.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Generated authentic exam questions: ${text.length} characters`);
      
      // Try to parse JSON, fallback to simple array
      try {
        const questions = JSON.parse(text);
        if (Array.isArray(questions)) {
          return questions.map((q, index) => {
            if (typeof q === 'string') return q;
            if (q.question) {
              return `**Question ${index + 1}:** ${q.question}

A) ${q.options?.A || ''}
B) ${q.options?.B || ''}
C) ${q.options?.C || ''}
D) ${q.options?.D || ''}

**Correct Answer:** ${q.correctAnswer}
**Explanation:** ${q.explanation}

---`;
            }
            return JSON.stringify(q);
          });
        }
        return [text];
      } catch (parseError) {
        console.log('Could not parse JSON, returning raw text');
        return [text];
      }
    } catch (error) {
      console.error('Error generating authentic exam questions:', error);
      return ['Error generating questions. Please try again.'];
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

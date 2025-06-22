import fs from 'fs';
import { db } from './server/db';
import { quizzes } from './shared/schema';

// Extract individual questions using regex patterns
async function addHomeostasisQuestions() {
  try {
    console.log('📚 Reading homeostasis questions file...');
    
    const fileContent = fs.readFileSync('attached_assets/Pasted--question-Concerning-Homeostasis-Homeostatic-control-systems-minimize-changes-in-t-1750555872562_1750555872600.txt', 'utf8');
    
    // Use regex to extract question, answer, and explanation from each block
    const questionPattern = /"question":\s*"([^"]+)"/g;
    const answerPattern = /"answer":\s*(True|False)/g;
    const explanationPattern = /"explanation":\s*"([^"]+)"/g;
    
    const questions: any[] = [];
    let questionMatch, answerMatch, explanationMatch;
    
    // Reset regex lastIndex
    questionPattern.lastIndex = 0;
    answerPattern.lastIndex = 0;
    explanationPattern.lastIndex = 0;
    
    while ((questionMatch = questionPattern.exec(fileContent)) !== null) {
      answerMatch = answerPattern.exec(fileContent);
      explanationMatch = explanationPattern.exec(fileContent);
      
      if (questionMatch && answerMatch && explanationMatch) {
        const questionText = questionMatch[1];
        const answerValue = answerMatch[1] === 'True';
        const explanationText = explanationMatch[1];
        
        // Skip if question doesn't seem complete
        if (questionText.length < 10) continue;
        
        const quizQuestion = {
          question: questionText,
          options: [
            { text: "True", value: true },
            { text: "False", value: false }
          ],
          correctAnswer: answerValue ? 0 : 1, // 0 for True, 1 for False
          explanation: explanationText,
          difficulty: "medium" as const,
          xpReward: 10,
          topicId: null
        };
        
        questions.push(quizQuestion);
        console.log(`✅ Parsed: ${questionText.substring(0, 80)}...`);
      }
    }
    
    console.log(`📝 Successfully parsed ${questions.length} homeostasis questions`);
    
    // Insert questions into database
    if (questions.length > 0) {
      console.log('💾 Inserting questions into Supabase database...');
      
      let successCount = 0;
      for (const question of questions) {
        try {
          await db.insert(quizzes).values(question);
          successCount++;
        } catch (insertError) {
          console.error(`❌ Error inserting question: ${insertError}`);
        }
      }
      
      console.log(`🎉 Successfully added ${successCount} homeostasis MCQ questions to the database!`);
      
      // Verify the questions were added
      const totalQuizzes = await db.select().from(quizzes);
      console.log(`📊 Total questions in database: ${totalQuizzes.length}`);
      
    } else {
      console.log('❌ No valid questions found to insert');
    }
    
  } catch (error) {
    console.error('❌ Error processing homeostasis questions:', error);
  }
}

// Run the script
addHomeostasisQuestions().then(() => {
  console.log('✨ Homeostasis questions import completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
import fs from 'fs';
import { db } from './server/db';
import { quizzes } from './shared/schema';

// Parse the homeostasis questions file and add to database
async function addHomeostasisQuestions() {
  try {
    console.log('📚 Reading homeostasis questions file...');
    
    // Read the questions file
    const fileContent = fs.readFileSync('attached_assets/Pasted--question-Concerning-Homeostasis-Homeostatic-control-systems-minimize-changes-in-t-1750555872562_1750555872600.txt', 'utf8');
    
    // Parse questions from the JSON-like format
    const questions: any[] = [];
    
    // Split by question blocks more carefully
    const lines = fileContent.split('\n');
    let currentQuestion = '';
    let inQuestion = false;
    let braceCount = 0;
    
    for (const line of lines) {
      if (line.trim() === '{') {
        inQuestion = true;
        braceCount = 1;
        currentQuestion = '{\n';
      } else if (inQuestion) {
        currentQuestion += line + '\n';
        
        // Count braces to find complete objects
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        if (braceCount === 0) {
          // Complete question object found
          try {
            // Clean up the JSON string
            let cleanJson = currentQuestion.trim();
            
            // Fix common JSON issues
            cleanJson = cleanJson.replace(/:\s*False/g, ': false');
            cleanJson = cleanJson.replace(/:\s*True/g, ': true');
            cleanJson = cleanJson.replace(/,(\s*})/g, '$1'); // Remove trailing commas
            
            const questionObj = JSON.parse(cleanJson);
            
            if (questionObj.question && questionObj.hasOwnProperty('answer')) {
              // Convert the question format to match your quizzes table
              const quizQuestion = {
                question: questionObj.question,
                options: [
                  { text: "True", value: true },
                  { text: "False", value: false }
                ],
                correctAnswer: questionObj.answer === true ? 0 : 1, // 0 for True, 1 for False
                explanation: questionObj.explanation || questionObj.ai_explanation || '',
                difficulty: "medium" as const,
                xpReward: 10,
                topicId: null
              };
              
              questions.push(quizQuestion);
              console.log(`✅ Processed: ${questionObj.question.substring(0, 80)}...`);
            }
          } catch (parseError) {
            console.log(`⚠️  Skipping malformed question: ${parseError}`);
          }
          
          // Reset for next question
          inQuestion = false;
          currentQuestion = '';
          braceCount = 0;
        }
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
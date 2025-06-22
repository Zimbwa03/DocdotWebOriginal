import fs from 'fs';
import { db } from './server/db.ts';
import { quizzes } from './shared/schema.ts';

// Parse the homeostasis questions file and add to database
async function addHomeostasisQuestions() {
  try {
    console.log('📚 Reading homeostasis questions file...');
    
    // Read the questions file
    const fileContent = fs.readFileSync('attached_assets/Pasted--question-Concerning-Homeostasis-Homeostatic-control-systems-minimize-changes-in-t-1750555872562_1750555872600.txt', 'utf8');
    
    // Parse questions from the JSON-like format
    const questions = [];
    const questionBlocks = fileContent.split('\n  },\n  {').filter(block => block.trim());
    
    console.log(`📊 Found ${questionBlocks.length} question blocks to process`);
    
    for (let i = 0; i < questionBlocks.length; i++) {
      let block = questionBlocks[i].trim();
      
      // Clean up the block to make it valid JSON
      if (!block.startsWith('{')) {
        block = '{' + block;
      }
      if (!block.endsWith('}')) {
        block = block + '}';
      }
      
      // Remove any trailing commas before closing braces
      block = block.replace(/,(\s*})/g, '$1');
      
      try {
        // Parse the question object
        const questionObj = JSON.parse(block);
        
        if (questionObj.question && questionObj.hasOwnProperty('answer')) {
          // Convert the question format to match your quizzes table
          const quizQuestion = {
            question: questionObj.question,
            options: JSON.stringify([
              { text: "True", value: true },
              { text: "False", value: false }
            ]),
            correctAnswer: questionObj.answer === true ? 0 : 1, // 0 for True, 1 for False
            explanation: questionObj.explanation || questionObj.ai_explanation || '',
            difficulty: "medium",
            xpReward: 10,
            topicId: null // Will be set to appropriate topic if exists
          };
          
          questions.push(quizQuestion);
          console.log(`✅ Processed: ${questionObj.question.substring(0, 80)}...`);
        }
      } catch (parseError) {
        console.log(`⚠️  Skipping malformed question block ${i + 1}: ${parseError.message}`);
        continue;
      }
    }
    
    console.log(`📝 Successfully parsed ${questions.length} homeostasis questions`);
    
    // Insert questions into database
    if (questions.length > 0) {
      console.log('💾 Inserting questions into Supabase database...');
      
      for (const question of questions) {
        try {
          await db.insert(quizzes).values(question);
        } catch (insertError) {
          console.error(`❌ Error inserting question: ${insertError.message}`);
        }
      }
      
      console.log(`🎉 Successfully added ${questions.length} homeostasis MCQ questions to the database!`);
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
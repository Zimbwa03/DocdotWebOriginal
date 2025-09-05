import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpueGNlamtzc2d2eGhkdXJtdnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ4MDAsImV4cCI6MjA1MDU1MDgwMH0.8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMcqTopics() {
  try {
    console.log('Testing MCQ topics...');
    
    // Get all distinct topics for Upper Limb
    const { data: topics, error: topicsError } = await supabase
      .from('mcq_questions')
      .select('topic')
      .eq('category', 'Upper Limb')
      .order('topic');
    
    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      return;
    }
    
    const distinctTopics = [...new Set(topics.map(t => t.topic))];
    console.log('Available topics in Upper Limb:', distinctTopics);
    
    // Test Pectoral Region specifically
    const { data: pectoralQuestions, error: pectoralError } = await supabase
      .from('mcq_questions')
      .select('*')
      .eq('category', 'Upper Limb')
      .eq('topic', 'Pectoral Region')
      .limit(5);
    
    if (pectoralError) {
      console.error('Error fetching Pectoral Region questions:', pectoralError);
      return;
    }
    
    console.log(`Found ${pectoralQuestions.length} Pectoral Region questions:`);
    pectoralQuestions.forEach((q, i) => {
      console.log(`${i+1}. ${q.question.substring(0, 100)}...`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMcqTopics();

// Simple test to check database connection and topic names
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3hlamtzc2d2eGhkdXJtdnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjUwNDEsImV4cCI6MjA2MzQ0MTA0MX0.vB91dobZ0zsFTEAQiZ1nU5n94ppxdolpaDs2lUNox38';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('mcq_questions')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError);
    return;
  }

    console.log('✅ Supabase connection successful');
    
    // Get all distinct topics for Upper Limb
    console.log('\n📋 Fetching all topics for Upper Limb...');
    const { data: topics, error: topicsError } = await supabase
      .from('mcq_questions')
      .select('topic')
      .eq('category', 'Upper Limb')
      .order('topic');
    
    if (topicsError) {
      console.error('❌ Error fetching topics:', topicsError);
      return;
    }
    
    const distinctTopics = [...new Set(topics.map(t => t.topic))];
    console.log('Available topics in Upper Limb:');
    distinctTopics.forEach((topic, i) => {
      console.log(`${i + 1}. "${topic}"`);
    });
    
    // Test Pectoral Region specifically
    console.log('\n🔍 Testing Pectoral Region questions...');
    const { data: pectoralQuestions, error: pectoralError } = await supabase
      .from('mcq_questions')
      .select('id, question, topic, category')
      .eq('category', 'Upper Limb')
      .eq('topic', 'Pectoral Region')
      .limit(3);
    
    if (pectoralError) {
      console.error('❌ Error fetching Pectoral Region questions:', pectoralError);
      return;
    }
    
    console.log(`Found ${pectoralQuestions.length} Pectoral Region questions:`);
    pectoralQuestions.forEach((q, i) => {
      console.log(`${i + 1}. [${q.topic}] ${q.question.substring(0, 80)}...`);
    });
    
    // Test if there are any questions with similar topic names
    console.log('\n🔍 Checking for similar topic names...');
    const { data: similarTopics, error: similarError } = await supabase
      .from('mcq_questions')
      .select('topic')
      .eq('category', 'Upper Limb')
      .ilike('topic', '%pector%')
      .order('topic');
    
    if (similarError) {
      console.error('❌ Error fetching similar topics:', similarError);
      return;
    }
    
    const distinctSimilar = [...new Set(similarTopics.map(t => t.topic))];
    console.log('Topics containing "pector":');
    distinctSimilar.forEach((topic, i) => {
      console.log(`${i + 1}. "${topic}"`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
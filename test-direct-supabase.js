import { createClient } from '@supabase/supabase-js';

// Test direct Supabase connection
const supabaseUrl = 'https://jncxejkssgvxhdurmvxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3hlamtzc2d2eGhkdXJtdnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjUwNDEsImV4cCI6MjA2MzQ0MTA0MX0.vB91dobZ0zsFTEAQiZ1nU5n94ppxdolpaDs2lUNox38';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectSupabase() {
  console.log('🔌 Testing direct Supabase connection...');
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('mcq_questions')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError);
      return;
    }
    
    console.log('✅ Basic connection successful!');
    
    // Test getting topics for Upper Limb
    console.log('\n2. Testing topics query...');
    const { data: topicsData, error: topicsError } = await supabase
      .from('mcq_questions')
      .select('topic')
      .eq('category', 'Upper Limb');
    
    if (topicsError) {
      console.error('❌ Topics query failed:', topicsError);
      return;
    }
    
    const uniqueTopics = [...new Set(topicsData.map(item => item.topic))];
    console.log('✅ Topics query successful!');
    console.log(`📋 Found ${uniqueTopics.length} unique topics:`, uniqueTopics);
    
    // Test getting questions for Arm topic
    console.log('\n3. Testing questions query for Arm topic...');
    const { data: questionsData, error: questionsError } = await supabase
      .from('mcq_questions')
      .select('*')
      .eq('category', 'Upper Limb')
      .eq('topic', 'Arm')
      .limit(3);
    
    if (questionsError) {
      console.error('❌ Questions query failed:', questionsError);
      return;
    }
    
    console.log('✅ Questions query successful!');
    console.log(`📚 Found ${questionsData.length} questions for Arm topic:`);
    questionsData.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q.question.substring(0, 100)}...`);
      console.log(`     Answer: ${q.answer ? 'True' : 'False'}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDirectSupabase();




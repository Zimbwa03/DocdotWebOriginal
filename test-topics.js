// Test script to check topic names in the database
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://postgres:Ngonidzashe2003.@db.jncxejkssgvxhdurmvxy.supabase.co:5432/postgres');

async function testTopics() {
  try {
    console.log('🔍 Connecting to Supabase database...');
    console.log('✅ Connected successfully!');
    
    // Get all distinct topics for Upper Limb
    console.log('\n📋 Fetching all topics for Upper Limb...');
    const topicsResult = await sql`
      SELECT DISTINCT topic 
      FROM mcq_questions 
      WHERE category = 'Upper Limb' 
      ORDER BY topic
    `;
    
    console.log('Available topics in Upper Limb:');
    topicsResult.forEach((row, i) => {
      console.log(`${i + 1}. "${row.topic}"`);
    });
    
    // Test Pectoral Region specifically
    console.log('\n🔍 Testing Pectoral Region questions...');
    const pectoralResult = await sql`
      SELECT id, question, topic, category
      FROM mcq_questions 
      WHERE category = 'Upper Limb' 
      AND topic = 'Pectoral Region'
      LIMIT 3
    `;
    
    console.log(`Found ${pectoralResult.length} Pectoral Region questions:`);
    pectoralResult.forEach((q, i) => {
      console.log(`${i + 1}. [${q.topic}] ${q.question.substring(0, 80)}...`);
    });
    
    // Test if there are any questions with similar topic names
    console.log('\n🔍 Checking for similar topic names...');
    const similarResult = await sql`
      SELECT DISTINCT topic 
      FROM mcq_questions 
      WHERE category = 'Upper Limb' 
      AND topic ILIKE '%pector%'
      ORDER BY topic
    `;
    
    console.log('Topics containing "pector":');
    similarResult.forEach((row, i) => {
      console.log(`${i + 1}. "${row.topic}"`);
    });
    
    // Test a few more topics to see the pattern
    console.log('\n🔍 Testing other topics...');
    const otherTopics = ['Arm', 'Forearm', 'Hand'];
    
    for (const topic of otherTopics) {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM mcq_questions 
        WHERE category = 'Upper Limb' 
        AND topic = ${topic}
      `;
      
      console.log(`${topic}: ${result[0].count} questions`);
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testTopics();

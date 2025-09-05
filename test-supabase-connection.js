import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Test Supabase connection
const connectionString = 'postgresql://postgres:Ngonidzashe2003.@db.jncxejkssgvxhdurmvxy.supabase.co:5432/postgres';

console.log('🔌 Testing Supabase connection...');
console.log('Connection string:', connectionString.substring(0, 50) + '...');

const client = postgres(connectionString, {
  ssl: 'require',
  connect_timeout: 60,
  idle_timeout: 60,
  max: 10,
  onnotice: () => {} // Suppress notices
});

const db = drizzle(client);

async function testConnection() {
  try {
    console.log('📡 Attempting to connect to Supabase...');
    
    // Test basic connection
    const result = await client`SELECT 1 as test`;
    console.log('✅ Basic connection successful:', result);
    
    // Test mcq_questions table
    const questions = await client`
      SELECT id, question, category, topic, answer 
      FROM mcq_questions 
      WHERE category = 'Upper Limb' 
      LIMIT 5
    `;
    
    console.log('📚 MCQ Questions found:', questions.length);
    console.log('Sample questions:', questions);
    
    // Test distinct topics for Upper Limb
    const topics = await client`
      SELECT DISTINCT topic 
      FROM mcq_questions 
      WHERE category = 'Upper Limb'
      ORDER BY topic
    `;
    
    console.log('🏷️ Available topics for Upper Limb:');
    topics.forEach(topic => console.log(`  - ${topic.topic}`));
    
    // Test specific topic (Arm)
    const armQuestions = await client`
      SELECT id, question, answer, explanation
      FROM mcq_questions 
      WHERE category = 'Upper Limb' AND topic = 'Arm'
      LIMIT 3
    `;
    
    console.log('💪 Arm-specific questions found:', armQuestions.length);
    console.log('Sample Arm questions:', armQuestions);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

testConnection();
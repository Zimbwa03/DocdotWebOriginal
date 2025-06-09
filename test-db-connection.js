import postgres from 'postgres';

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  
  console.log('Testing Supabase connection...');
  console.log('DATABASE_URL configured:', !!connectionString);
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found');
    return;
  }

  try {
    const sql = postgres(connectionString);
    
    // Test basic connection
    const result = await sql`SELECT version()`;
    console.log('✅ Database connected successfully');
    console.log('PostgreSQL version:', result[0].version.split(' ')[1]);
    
    // Test if our tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'quiz_attempts', 'user_stats', 'ai_sessions', 'study_groups')
      ORDER BY table_name
    `;
    
    console.log('✅ Found tables:', tables.map(t => t.table_name));
    
    // Test users table structure
    const userColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.log('✅ Users table columns:', userColumns.length);
    
    // Test inserting a test record
    const testUserId = 'test-user-' + Date.now();
    const testEmail = `test-${Date.now()}@example.com`;
    
    await sql`
      INSERT INTO users (id, email, first_name, subscription_tier) 
      VALUES (${testUserId}, ${testEmail}, 'Test User', 'free')
    `;
    console.log('✅ Test user inserted successfully');
    
    // Clean up test data
    await sql`DELETE FROM users WHERE id = ${testUserId}`;
    console.log('✅ Test data cleaned up');
    
    await sql.end();
    console.log('✅ All database tests passed');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testConnection();
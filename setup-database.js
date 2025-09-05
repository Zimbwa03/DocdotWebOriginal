import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration
const DATABASE_URL = 'postgresql://postgres:Ngonidzashe2003.@db.jncxejkssgvxhdurmvxy.supabase.co:5432/postgres';

async function setupDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'setup_lecture_tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 Executing SQL migration...');
    await client.query(sqlContent);
    console.log('✅ Database tables created successfully');

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('lectures', 'lecture_transcripts', 'lecture_notes', 'lecture_processing_logs')
      ORDER BY table_name;
    `);

    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check RLS policies
    const policiesResult = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename IN ('lectures', 'lecture_transcripts', 'lecture_notes', 'lecture_processing_logs')
      ORDER BY tablename, policyname;
    `);

    console.log('🔒 RLS Policies created:');
    policiesResult.rows.forEach(row => {
      console.log(`  - ${row.tablename}: ${row.policyname} (${row.cmd})`);
    });

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Set your GEMINI_API_KEY environment variable');
    console.log('2. Run: npm install');
    console.log('3. Run: npm run dev');
    console.log('4. Test the Record feature in your application');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
setupDatabase().catch(console.error);

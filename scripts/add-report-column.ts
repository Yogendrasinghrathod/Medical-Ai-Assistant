import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

const sql = neon(process.env.DATABASE_URL);

async function addReportColumn() {
  try {
    // Check if column already exists
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='session_chat' AND column_name='report';
    `;
    
    if (checkResult.length > 0) {
      console.log('✅ report column already exists!');
      return;
    }

    // Add the report column
    await sql`
      ALTER TABLE "session_chat" ADD COLUMN IF NOT EXISTS "report" text;
    `;
    
    console.log('✅ report column added successfully!');
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('✅ report column already exists!');
    } else {
      console.error('❌ Error adding report column:', error);
      throw error;
    }
  }
}

addReportColumn()
  .then(() => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
}

const sql = neon(process.env.DATABASE_URL);

async function createSessionChatTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "session_chat" (
        "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_chat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
        "sessionId" varchar(255) NOT NULL,
        "createdBy" varchar(255) NOT NULL,
        "notes" text,
        "selectedDoctor" varchar(255),
        "createdOn" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "session_chat_sessionId_unique" UNIQUE("sessionId")
      );
    `;
    console.log('✅ session_chat table created successfully!');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('✅ session_chat table already exists!');
    } else {
      console.error('❌ Error creating table:', error);
      throw error;
    }
  }
}

createSessionChatTable();


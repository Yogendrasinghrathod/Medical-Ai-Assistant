import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function addCreditLedgerTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS "credit_ledger" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "email" varchar(255) NOT NULL,
      "type" varchar(32) NOT NULL,
      "amount" integer NOT NULL,
      "balanceAfter" integer NOT NULL,
      "reference" varchar(255),
      "note" varchar(255),
      "createdOn" timestamp DEFAULT now() NOT NULL
    );
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "credit_ledger_email_idx"
    ON "credit_ledger" ("email", "createdOn" DESC);
  `;
}

addCreditLedgerTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function addPaymentOrdersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS "payment_orders" (
      "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      "internalOrderId" varchar(40) NOT NULL UNIQUE,
      "razorpayOrderId" varchar(255),
      "email" varchar(255) NOT NULL,
      "packId" varchar(32) NOT NULL,
      "amount" integer NOT NULL,
      "currency" varchar(8) NOT NULL,
      "credits" integer NOT NULL,
      "status" varchar(32) NOT NULL,
      "razorpayPaymentId" varchar(255),
      "createdOn" timestamp DEFAULT now() NOT NULL
    );
  `;
}

addPaymentOrdersTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

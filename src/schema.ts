import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer()
});

export const SessionChatTable = pgTable("session_chat", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar({ length: 255 }).notNull().unique(),
  createdBy: varchar({ length: 255 }).notNull(),
  notes: text(),
  selectedDoctor: varchar({ length: 255 }),
  selectedDoctorId: integer(),
  report:text(),
  conversation:text(),
  createdOn: timestamp().defaultNow().notNull(),
});

export const PaymentOrdersTable = pgTable("payment_orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  internalOrderId: varchar({ length: 40 }).notNull().unique(),
  razorpayOrderId: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull(),
  packId: varchar({ length: 32 }).notNull(),
  amount: integer().notNull(),
  currency: varchar({ length: 8 }).notNull(),
  credits: integer().notNull(),
  status: varchar({ length: 32 }).notNull(),
  razorpayPaymentId: varchar({ length: 255 }),
  createdOn: timestamp().defaultNow().notNull(),
});

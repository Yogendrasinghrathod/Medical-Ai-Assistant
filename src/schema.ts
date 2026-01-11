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
  report:text(),
  conversation:text(),
  createdOn: timestamp().defaultNow().notNull(),
});

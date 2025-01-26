import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const messagesTable = sqliteTable("messages", {
  id: int().primaryKey({ autoIncrement: true }),
  text: text().notNull(),
  sender: text().notNull(),
  topic_id: int().notNull(),
  created: text()
});

export const topicsTable = sqliteTable("topics", {
    id: int().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
});

export const migrationsTable = sqliteTable('migrations', {
  id : int().primaryKey({ autoIncrement: true }),
  name : text().notNull()
})

export const settingsTable = sqliteTable('settings', {
  id : int().primaryKey(),
  api_token : text().notNull()
})
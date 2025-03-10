import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const messagesTable = sqliteTable("messages", {
  id: int().primaryKey({ autoIncrement: true }),
  text: text().notNull(),
  sender: text().notNull(),
  topic_id: int().notNull().references(() => topicsTable.id, { onDelete: 'cascade' }),
  created: text()
});

export const topicsTable = sqliteTable("topics", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
});

export const migrationsTable = sqliteTable('migrations', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull()
});

export const settingsTable = sqliteTable('settings', {
  id: int().primaryKey(),
  api_token: text().notNull(),
  context_messages: int().notNull(),
  model: text().notNull()
});

export const imagesTable = sqliteTable('images', {
  id: int().primaryKey({ autoIncrement: true }),
  base64_image: text().notNull(),
  message_id: int().notNull().references(() => messagesTable.id, { onDelete: 'cascade' }),
  topic_id: int().notNull().references(() => topicsTable.id, { onDelete: 'cascade' })
});

export const messagesRelations = relations(messagesTable, ({ many }) => ({
  images: many(imagesTable)
}));

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  message: one(messagesTable, {
    fields: [imagesTable.message_id],
    references: [messagesTable.id]
  })
}));
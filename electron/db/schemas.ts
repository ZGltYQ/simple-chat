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
  source: text().notNull(),
  api_token: text().notNull(),
  context_messages: int().notNull(),
  model: text().notNull(),
  gpu_layers: int().notNull(),
  context_size: int().notNull(),
  batch_size: int().notNull(),
  threads : int().notNull(),
  selected: int().notNull(),
  system_message: text().notNull()
});

export const functionsTable = sqliteTable('functions', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
  active : int().notNull(),
  params: text().notNull(),
  handler: text().notNull()
})

export const imagesTable = sqliteTable('images', {
  id: int().primaryKey({ autoIncrement: true }),
  base64_image: text().notNull(),
  description: text(),
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
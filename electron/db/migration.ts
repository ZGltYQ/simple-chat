import { LibSQLDatabase } from "drizzle-orm/libsql";
import { migrationsTable } from "./schema";

const migrations = [
    {
        name: 'create_messages',
        query : `CREATE TABLE "messages" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "text" text NOT NULL,
        "sender" text NOT NULL,
        "topic_id" integer NOT NULL,
        "created" DATETIME,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
        );`
    },
    {
        name: 'create_topics',
        query : `CREATE TABLE "topics" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" text NOT NULL
        );`
    },
    {
        name: 'settings',
        query: `CREATE TABLE "settings" (
        "id" integer PRIMARY KEY NOT NULL,
        "api_token" text NOT NULL,
        "context_messages" INTEGER DEFAULT 30 NOT NULL
        );`
    },
    {
        name: 'create_images',
        query: `CREATE TABLE "images" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "base64_image" text NOT NULL,
        "message_id" integer NOT NULL,
        "topic_id" integer NOT NULL,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
        );`
    },
    {
        name: 'settings_add_model_field',
        query: `ALTER TABLE "settings" ADD COLUMN "model" TEXT DEFAULT "gpt-4o" NOT NULL;`
    },
    {
        name: 'settings_add_system_message_field',
        query: `ALTER TABLE "settings" ADD COLUMN "system_message" TEXT DEFAULT "" NOT NULL;`
    },
    {
        name : 'add_source_field',
        query: `ALTER TABLE "settings" ADD COLUMN "source" TEXT DEFAULT "openai" NOT NULL;`
    }
];

export default async function runMigration(db: LibSQLDatabase) {
    const tables = await db.run(`SELECT name FROM sqlite_master WHERE type='table';`);

    if (!tables?.rows.find(({ name }) => name === "migrations")) {
        await db.run(`CREATE TABLE "migrations" (
            "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
            "name" text NOT NULL
        );`)
    }

    const existedMigrations : string[] = (await db.select({ name: migrationsTable?.name }).from(migrationsTable)).map(({ name }) => name);

    for (const migration of migrations) {
        if (existedMigrations.includes(migration?.name)) continue;

        const result = await db.run(migration?.query);

        if (result) await db.insert(migrationsTable).values({ name: migration?.name });
    }
}
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { migrationsTable } from "./schema";

const migrations = [
    {
        name: 'create_topics',
        query: `CREATE TABLE topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            title TEXT NOT NULL
        );`
    },
    {
        name: 'create_messages',
        query: `CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            text TEXT NOT NULL,
            sender TEXT NOT NULL,
            topic_id INTEGER NOT NULL,
            created DATETIME,
            FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
        );`
    },
    {
        name: 'create_settings',
        query: `CREATE TABLE settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            source TEXT NOT NULL,
            selected INTEGER DEFAULT 0 NOT NULL,
            api_token TEXT,
            model TEXT NOT NULL,
            system_message TEXT,
            gpu_layers INTEGER DEFAULT 35 NOT NULL,
            context_size INTEGER DEFAULT 8192 NOT NULL,
            batch_size INTEGER DEFAULT 512 NOT NULL,
            threads INTEGER DEFAULT 6 NOT NULL,
            context_messages INTEGER DEFAULT 30 NOT NULL
        );`
    },
    {
        name: 'create_images',
        query: `CREATE TABLE images (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            base64_image TEXT NOT NULL,
            message_id INTEGER NOT NULL,
            topic_id INTEGER NOT NULL,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
            FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
        );`
    },
    {
        name: 'insert_default_sources',
        query: `INSERT INTO settings (id, source, selected, api_token, model, system_message, context_messages) 
            VALUES 
            (1, 'openai', 1, '', 'gpt-4o', '', 30),
            (2, 'deepseek', 0, '', 'deepseek-chat', '', 30),
            (3, 'local', 0, '', '', '', 30)`
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
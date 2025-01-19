import { LibSQLDatabase } from "drizzle-orm/libsql";
import { migrationsTable } from "./schema";


const migrations = [
    {
        name: 'create_messages',
        query : `CREATE TABLE "messages" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "text" text NOT NULL,
        "sender" text NOT NULL,
        "topic_id" integer NOT NULL
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
        "api_token" text NOT NULL
        );`
    }
]

export default async function runMigration(db: LibSQLDatabase) {
    db.run(`CREATE TABLE "migrations" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "name" text NOT NULL
    );`).catch();

    const existedMigrations : string[] = (await db.select({ name: migrationsTable?.name }).from(migrationsTable)).map(({ name }) => name);

    for (const migration of migrations) {
        if (existedMigrations.includes(migration?.name)) continue;

        const result = await db.run(migration?.query);

        if (result) await db.insert(migrationsTable).values({ name: migration?.name });
    }
}
import { drizzle, } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq, and } from 'drizzle-orm';

const client = createClient({ url: 'file:story' });

export const db = drizzle(client);

export default class Base {
    protected static db = db;
    protected static schema: any;

    static async create<T extends Record<string, any>>(data: T) {
        const result = await this.db.insert(this.schema).values(data).returning() as Record<string, any>[];
        
        return result[0];
    }

    static async findAll() {
        return await this.db.select().from(this.schema).all();
    }

    static async findById(id: number | string) {
        const result = await this.db
            .select()
            .from(this.schema)
            .where(eq(this.schema.id, id))
            .limit(1);

        return result[0] || null;
    }

    static async findWhere(conditions: Record<string, any>) {
        const whereClauses = Object.entries(conditions).map(([key, value]) => 
            eq(this.schema[key as keyof typeof this.schema], value)
        );

        return await this.db
            .select()
            .from(this.schema)
            .where(and(...whereClauses));
    }

    static async update(conditions: Record<string, any>, data: Partial<Record<string, any>>) {
        const whereClauses = Object.entries(conditions).map(([key, value]) => 
            eq(this.schema[key as keyof typeof this.schema], value)
        );

        const result = await this.db
            .update(this.schema)
            .set(data)
            .where(and(...whereClauses))
            .returning() as Record<string, any>[];
            
        return result[0]; // Returns the updated record
    }

    static async updateAll(data: Partial<Record<string, any>>) {
        const result = await this.db
            .update(this.schema)
            .set(data)
            .returning() as Record<string, any>[];
            
        return result[0]; // Returns the updated record
    }

    static async delete(conditions: Record<string, any>) {
        const whereClauses = Object.entries(conditions).map(([key, value]) => 
            eq(this.schema[key as keyof typeof this.schema], value)
        );

        await this.db
            .delete(this.schema)
            .where(and(...whereClauses));
        
        return true; // Confirms deletion
    }
}
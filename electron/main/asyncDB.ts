import sqlite3, { Database } from 'sqlite3'


export default class AsyncDB {
    private db: Database;

    constructor(dbName: string) {
        this.db = new sqlite3.Database(dbName);
    }

    public init() {
        return new Promise(resolve => this.db.serialize(() => resolve(null)))
    }

    public createTable(name: string) {
        return new Promise(resolve => {
            this.db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${name}';`, (_, response) => {
                if (!response) {
                  return this.db.run(`CREATE TABLE messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    text TEXT NOT NULL,
                    sender TEXT NOT NULL,
                    topic_id INTEGER NOT NULL
                  );`, (...args) => resolve(args))
                }

                return resolve(null)
            })
        })
    }

    public selectRows(name: string, where: string = '') {
        return new Promise(resolve => {
            this.db.all(`SELECT * FROM ${name} ${where};`, (_, rows) => resolve(rows))
        })
    }

    public insertRow(name: string, body: Record<string, string>) {
        return new Promise(resolve => {
            const keys = Object.keys(body);
            const values = Object.values(body);

            console.log(values)

            this.db.run(`INSERT INTO ${name}
                (${keys.join(',')})
                VALUES (${new Array(values?.length).fill('?').join(',')})`, 
                values, 
                (result: any, error :any) => {
                console.log({ error, result })
                resolve(result)
            })
        })
    }
}
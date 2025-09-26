import {Injectable} from '@angular/core';
import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';

@Injectable({providedIn: 'root'})
export class DbService {
    private dbPromise: Promise<Database> | null = null;
    private initialized = false;

    private async getDb(): Promise<Database> {
        if (!this.dbPromise) {
            // Fetch DSN securely from Tauri backend instead of hardcoding in the frontend
            const dsn = await invoke<string>('get_mysql_dsn');
            this.dbPromise = Database.load(dsn);
        }
        return this.dbPromise;
    }

    async init(): Promise<boolean> {
        if (this.initialized) return true;
        await this.getDb();
        // No migrations or seeding are performed; assumes schema already exists in MySQL.
        this.initialized = true;
        return true;
    }

    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        const db = await this.getDb();
        return db.select<T[]>(sql, params);
    }

    async execute(sql: string, params: any[] = []): Promise<void> {
        const db = await this.getDb();
        await db.execute(sql, params);
    }
}

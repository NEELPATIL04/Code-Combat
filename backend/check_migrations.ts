
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/db/schema';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'codeCombat',
});

const db = drizzle(pool, { schema });

async function checkMigrations() {
    try {
        const res = await pool.query('SELECT * FROM "__drizzle_migrations" ORDER BY created_at DESC');
        console.log('Migrations in DB:', JSON.stringify(res.rows, null, 2));
    } catch (error) {
        console.error('Error checking migrations:', error);
    } finally {
        await pool.end();
    }
}

checkMigrations();

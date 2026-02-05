import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Drizzle Kit Configuration
 * This file configures how Drizzle generates migrations and connects to the database
 */
export default {
  schema: './src/db/schema.ts', // Where our database schema is defined
  out: './src/db/migrations',   // Where migration files will be generated
  dialect: 'postgresql',         // Database type
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'codeCombat',
    ssl: false,                  // Disable SSL for local development
  },
} satisfies Config;

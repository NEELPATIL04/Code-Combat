import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';
import { env } from './env';

/**
 * PostgreSQL Connection Pool
 * Creates a pool of reusable database connections
 * This is more efficient than creating a new connection for each query
 */
const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,                      // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,     // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Error if connection takes more than 2 seconds
  ssl: false,                   // Disable SSL for local development
});

/**
 * Drizzle ORM Instance
 * This is the main database object used throughout the application
 * Use this to perform all database operations (select, insert, update, delete)
 */
export const db = drizzle(pool, { schema });

/**
 * Test Database Connection
 * Verifies that we can connect to PostgreSQL
 * Returns true if successful, false if connection fails
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Get a connection from the pool
    const client = await pool.connect();

    // Run a simple query to test the connection
    await client.query('SELECT NOW()');

    // Release the connection back to the pool
    client.release();

    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}

/**
 * Close Database Connection Pool
 * Should be called when shutting down the application
 * Ensures all connections are properly closed
 */
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
  console.log('Database connection pool closed');
}

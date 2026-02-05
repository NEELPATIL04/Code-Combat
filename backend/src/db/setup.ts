import { Pool } from 'pg';
import { env } from '../config/env';

/**
 * Database Setup Script
 * Creates the database if it doesn't exist
 */
async function setupDatabase() {
  // Connect to postgres database (default database)
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: 'postgres', // Connect to default database
  });

  try {
    // Check if database exists
    const result = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [env.DB_NAME]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`Creating database "${env.DB_NAME}"...`);
      await pool.query(`CREATE DATABASE "${env.DB_NAME}"`);
      console.log('✅ Database created successfully!');
    } else {
      console.log(`ℹ️  Database "${env.DB_NAME}" already exists.`);
    }
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase();

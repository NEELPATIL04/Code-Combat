import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env';

/**
 * Database Migration Runner
 * This script applies all pending migrations to the database
 *
 * Migrations are auto-generated SQL files created by Drizzle Kit
 * They contain the SQL commands to create/modify database tables
 *
 * Run this script with: npm run db:migrate
 */
async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  console.log(`   Database: ${env.DB_NAME}`);
  console.log(`   Host: ${env.DB_HOST}:${env.DB_PORT}`);
  console.log('');

  // Create a new database connection pool
  const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  });

  const db = drizzle(pool);

  try {
    // Apply all migrations from the migrations folder
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('✅ Migrations completed successfully!');
    console.log('   Database schema is up to date.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('');
    console.error('Common issues:');
    console.error('   1. Database does not exist - create it first');
    console.error('   2. Wrong credentials in .env file');
    console.error('   3. PostgreSQL is not running');
    console.error('   4. No migrations generated - run: npm run db:generate');
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run migrations
runMigrations();

import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from './schema';
import { hashPassword } from '../utils/password.util';

/**
 * Database Seed Script
 * Creates initial data in the database
 * Currently seeds one super admin user
 *
 * Run this script with: npm run db:seed
 *
 * ⚠️  IMPORTANT: Change the default password in production!
 */
async function seed() {
  console.log('🌱 Starting database seed...');
  console.log('');

  try {
    // Check if super admin already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'superadmin'))
      .limit(1);

    if (existingAdmin) {
      console.log('ℹ️  Super admin already exists. Skipping seed.');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Hash the default password
    console.log('🔐 Hashing password...');
    const hashedPassword = await hashPassword('superadmin123');

    // Create super admin user
    console.log('👤 Creating super admin user...');
    const [newAdmin] = await db
      .insert(users)
      .values({
        username: 'superadmin',
        email: 'superadmin@codecombat.com',
        password: hashedPassword,
        role: 'super_admin',
      })
      .returning();

    console.log('');
    console.log('✅ Super admin created successfully!');
    console.log('='.repeat(50));
    console.log('📋 Login Credentials:');
    console.log(`   Username: ${newAdmin.username}`);
    console.log('   Password: superadmin123');
    console.log(`   Role: ${newAdmin.role}`);
    console.log('='.repeat(50));
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password in production!');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    console.error('');
    console.error('Make sure:');
    console.error('   1. Database exists and migrations have run');
    console.error('   2. Database connection details are correct');
    process.exit(1);
  }

  process.exit(0);
}

// Run seed
seed();

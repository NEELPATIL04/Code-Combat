import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from './schema';
import { hashPassword } from '../utils/password.util';

/**
 * Database Seed Script
 * Creates initial test data in the database
 * Creates admin and player accounts for testing
 *
 * Run this script with: npm run db:seed
 *
 * ⚠️  IMPORTANT: Change the default password in production!
 */
async function seed() {
  console.log('🌱 Starting database seed...');
  console.log('');

  try {
    // Hash the test password (1234)
    console.log('🔐 Hashing passwords...');
    const testPassword = await hashPassword('1234');

    // Define test users
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@codecombat.com',
        password: testPassword,
        role: 'admin' as const,
      },
      {
        username: 'player1',
        email: 'player1@codecombat.com',
        password: testPassword,
        role: 'player' as const,
      },
      {
        username: 'player2',
        email: 'player2@codecombat.com',
        password: testPassword,
        role: 'player' as const,
      },
    ];

    console.log('👥 Creating test users...');
    const createdUsers = [];

    for (const userData of testUsers) {
      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username))
        .limit(1);

      if (existingUser) {
        console.log(`   ⏭️  ${userData.username} already exists, skipping...`);
        createdUsers.push(existingUser);
      } else {
        const [newUser] = await db
          .insert(users)
          .values(userData)
          .returning();
        console.log(`   ✅ Created ${userData.username} (${userData.role})`);
        createdUsers.push(newUser);
      }
    }

    console.log('');
    console.log('✅ Database seeding completed!');
    console.log('='.repeat(60));
    console.log('📋 Test User Credentials (Password: 1234 for all):');
    console.log('='.repeat(60));
    createdUsers.forEach(user => {
      console.log(`   Username: ${user.username.padEnd(15)} | Role: ${user.role}`);
    });
    console.log('='.repeat(60));
    console.log('');
    console.log('⚠️  IMPORTANT: These are test credentials. Change in production!');
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

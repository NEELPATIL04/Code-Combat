import { pgTable, serial, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

/**
 * User Role Enum
 * Defines the three user roles in the system:
 * - super_admin: Has full system access, can manage admins and players
 * - admin: Can create and manage contests
 * - player: Can participate in contests and solve coding challenges
 */
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin', 'player']);

/**
 * Users Table
 * Stores all user accounts in the system with authentication details
 */
export const users = pgTable('users', {
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // Unique username for login (indexed for fast lookup)
  username: varchar('username', { length: 50 }).notNull().unique(),

  // Email address (indexed, unique, for future email verification)
  email: varchar('email', { length: 255 }).notNull().unique(),

  // Hashed password using bcrypt (never store plain passwords!)
  password: varchar('password', { length: 255 }).notNull(),

  // User role determines what actions they can perform
  role: userRoleEnum('role').notNull().default('player'),

  // Timestamp when user account was created
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Timestamp when user information was last updated
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types inferred from the schema
// User: type for selecting data from the database
// NewUser: type for inserting new data into the database
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

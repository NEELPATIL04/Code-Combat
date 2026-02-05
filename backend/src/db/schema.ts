import { pgTable, serial, varchar, timestamp, pgEnum, text, integer, boolean } from 'drizzle-orm/pg-core';

/**
 * User Role Enum
 * Defines the three user roles in the system:
 * - super_admin: Has full system access, can manage admins and players
 * - admin: Can create and manage contests
 * - player: Can participate in contests and solve coding challenges
 */
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'admin', 'player']);

/**
 * Contest Status Enum
 * Defines the status of contests:
 * - upcoming: Contest is scheduled but not started
 * - active: Contest is currently running
 * - completed: Contest has ended
 */
export const contestStatusEnum = pgEnum('contest_status', ['upcoming', 'active', 'completed']);

/**
 * Contest Difficulty Enum
 * Defines the difficulty level of contests
 */
export const contestDifficultyEnum = pgEnum('contest_difficulty', ['Easy', 'Medium', 'Hard']);

/**
 * Users Table
 * Stores all user accounts in the system with authentication details
 */
export const users = pgTable('users', {
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // Unique username for login (indexed for fast lookup)
  username: varchar('username', { length: 50 }).notNull().unique(),

  // First name of the user
  firstName: varchar('first_name', { length: 100 }),

  // Last name of the user
  lastName: varchar('last_name', { length: 100 }),

  // Email address (indexed, unique, for future email verification)
  email: varchar('email', { length: 255 }).notNull().unique(),

  // Hashed password using bcrypt (never store plain passwords!)
  password: varchar('password', { length: 255 }).notNull(),

  // Company or school name
  companySchool: varchar('company_school', { length: 255 }),

  // User role determines what actions they can perform
  role: userRoleEnum('role').notNull().default('player'),

  // Account status - active or banned
  status: varchar('status', { length: 20 }).notNull().default('active'),

  // Timestamp when user account was created
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Timestamp when user information was last updated
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Contests Table
 * Stores contest information created by admins
 */
export const contests = pgTable('contests', {
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // Contest title
  title: varchar('title', { length: 255 }).notNull(),

  // Contest description
  description: text('description'),

  // Difficulty level
  difficulty: contestDifficultyEnum('difficulty').notNull().default('Medium'),

  // Duration in minutes
  duration: integer('duration').notNull(),

  // Contest status
  status: contestStatusEnum('status').notNull().default('upcoming'),

  // Contest start password (optional, for security)
  startPassword: varchar('start_password', { length: 255 }),

  // Whether contest has been started
  isStarted: boolean('is_started').notNull().default(false),

  // When the contest was actually started
  startedAt: timestamp('started_at'),

  // Created by admin ID
  createdBy: integer('created_by').notNull(),

  // Timestamp when contest was created
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Timestamp when contest was last updated
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tasks Table
 * Stores coding tasks/problems associated with contests
 */
export const tasks = pgTable('tasks', {
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // Associated contest ID
  contestId: integer('contest_id').notNull(),

  // Task title
  title: varchar('title', { length: 255 }).notNull(),

  // Task description/problem statement
  description: text('description').notNull(),

  // Difficulty level
  difficulty: contestDifficultyEnum('difficulty').notNull().default('Medium'),

  // Maximum points for this task
  maxPoints: integer('max_points').notNull().default(100),

  // Order/position in the contest
  orderIndex: integer('order_index').notNull().default(0),

  // Timestamp when task was created
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Timestamp when task was last updated
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Contest Participants Table
 * Maps users to contests they are assigned to
 */
export const contestParticipants = pgTable('contest_participants', {
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // Contest ID
  contestId: integer('contest_id').notNull(),

  // User ID
  userId: integer('user_id').notNull(),

  // Whether participant has started the contest
  hasStarted: boolean('has_started').notNull().default(false),

  // When participant started the contest
  startedAt: timestamp('started_at'),

  // Total score achieved
  score: integer('score').notNull().default(0),

  // Timestamp when participant was added
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types inferred from the schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Contest = typeof contests.$inferSelect;
export type NewContest = typeof contests.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type ContestParticipant = typeof contestParticipants.$inferSelect;
export type NewContestParticipant = typeof contestParticipants.$inferInsert;

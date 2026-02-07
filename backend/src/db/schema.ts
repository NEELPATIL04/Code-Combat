import { pgTable, serial, varchar, timestamp, pgEnum, text, integer, boolean, json } from 'drizzle-orm/pg-core';

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

  // Scheduled start time
  scheduledStartTime: timestamp('scheduled_start_time'),

  // Scheduled end time
  endTime: timestamp('end_time'),

  // Whether full screen mode is enforced for this contest
  fullScreenMode: boolean('full_screen_mode').notNull().default(true),

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

  // Allowed languages (JSON array of strings)
  allowedLanguages: json('allowed_languages').$type<string[]>().notNull().default([]),

  // Function signature for boilerplate (e.g., "twoSum(nums, target)")
  functionName: varchar('function_name', { length: 255 }),

  // Boilerplate templates per language (JSON object with language keys)
  // Example: { "javascript": "function twoSum(nums, target) {\n  // Your code here\n}", "python": "def two_sum(nums, target):\n    # Your code here\n    pass" }
  boilerplateCode: json('boilerplate_code').$type<Record<string, string>>(),

  // Test runner templates per language (wraps user code)
  // Example for JS: "const result = {{functionName}}({{params}});\nconsole.log(JSON.stringify(result));"
  testRunnerTemplate: json('test_runner_template').$type<Record<string, string>>(),

  // AI Assistance Configuration
  // Stores settings for hints and solutions
  // Example: { hintsEnabled: true, hintThreshold: 2, solutionThreshold: 5 }
  aiConfig: json('ai_config').$type<{
    hintsEnabled: boolean;
    hintThreshold: number; // Attempts before hint is available
    solutionThreshold: number; // Attempts before solution is available
  }>().default({
    hintsEnabled: true,
    hintThreshold: 2,
    solutionThreshold: 5
  }),
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

  // Rank in the contest
  rank: integer('rank'),

  // When participant completed the contest
  completedAt: timestamp('completed_at'),

  // Timestamp when participant was added
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Test Cases Table
 * Stores test cases for each task
 */
export const testCases = pgTable('test_cases', {
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // Associated task ID
  taskId: integer('task_id').notNull(),

  // Input data for the test case
  input: text('input').notNull(),

  // Expected output for the test case
  expectedOutput: text('expected_output').notNull(),

  // Whether this test case is visible to participants
  isHidden: boolean('is_hidden').notNull().default(false),

  // Order/position of test case
  orderIndex: integer('order_index').notNull().default(0),

  // Timestamp when test case was created
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Submissions Status Enum
 * Defines the status of code submissions
 */
export const submissionStatusEnum = pgEnum('submission_status', [
  'pending',
  'processing',
  'accepted',
  'wrong_answer',
  'time_limit_exceeded',
  'memory_limit_exceeded',
  'runtime_error',
  'compilation_error',
  'internal_error'
]);


/**
 * User Task Progress Table
 * Tracks user progress and unlocks for specific tasks
 */
export const userTaskProgress = pgTable('user_task_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  taskId: integer('task_id').notNull(),
  hintsUnlocked: integer('hints_unlocked').default(0),
  solutionUnlocked: boolean('solution_unlocked').default(false),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserTaskProgress = typeof userTaskProgress.$inferSelect;
export type NewUserTaskProgress = typeof userTaskProgress.$inferInsert;

/**
 * AI Usage Logs Table
 * Tracks all AI requests for auditing and quota management
 */
export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'), // Optional, in case of system calls
  contestId: integer('contest_id'), // Optional
  taskId: integer('task_id'), // Optional
  provider: varchar('provider', { length: 50 }).notNull(), // 'groq', 'gemini'
  model: varchar('model', { length: 50 }),
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'hint', 'solution', 'generate_task', 'evaluation'
  tokensUsed: integer('tokens_used'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

/**
 * Submissions Table
 * Stores code submissions from participants
 */
export const submissions = pgTable('submissions', {
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // User who submitted
  userId: integer('user_id').notNull(),

  // Task being solved
  taskId: integer('task_id').notNull(),

  // Contest ID
  contestId: integer('contest_id').notNull(),

  // Programming language used
  language: varchar('language', { length: 50 }).notNull(),

  // Judge0 language ID
  languageId: integer('language_id').notNull(),

  // Source code submitted
  sourceCode: text('source_code').notNull(),

  // Submission status
  status: submissionStatusEnum('status').notNull().default('pending'),

  // Judge0 submission token
  judge0Token: varchar('judge0_token', { length: 255 }),

  // Test results (JSON array)
  testResults: json('test_results').$type<any[]>(),

  // Number of test cases passed
  passedTests: integer('passed_tests').default(0),

  // Total number of test cases
  totalTests: integer('total_tests').default(0),

  // Execution time in milliseconds
  executionTime: integer('execution_time'),

  // Memory used in KB
  memoryUsed: integer('memory_used'),

  // Hints used for this submission
  hintsUsed: integer('hints_used').default(0),

  // Whether AI solution was used
  usedSolution: boolean('used_solution').default(false),

  // Score achieved
  score: integer('score').default(0),

  // Compilation error message
  compileOutput: text('compile_output'),

  // Runtime error message
  stderr: text('stderr'),

  // Timestamp when submitted
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),

  // Timestamp when processed
  processedAt: timestamp('processed_at'),
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

export type TestCase = typeof testCases.$inferSelect;
export type NewTestCase = typeof testCases.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

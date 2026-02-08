import { pgTable, serial, varchar, timestamp, pgEnum, text, integer, boolean, json, jsonb } from 'drizzle-orm/pg-core';

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
 * Contest Settings Table
 * Specific configuration for each contest
 */
export const contestSettings = pgTable('contest_settings', {
  id: serial('id').primaryKey(),

  contestId: integer('contest_id').notNull().references(() => contests.id, { onDelete: 'cascade' }).unique(),

  // Features
  testModeEnabled: boolean('test_mode_enabled').default(false),
  aiHintsEnabled: boolean('ai_hints_enabled').default(true),
  aiModeEnabled: boolean('ai_mode_enabled').default(true),
  fullScreenModeEnabled: boolean('full_screen_mode_enabled').default(true),
  allowCopyPaste: boolean('allow_copy_paste').default(false),
  enableActivityLogs: boolean('enable_activity_logs').default(false),

  // Media Monitoring
  requireCamera: boolean('require_camera').default(false),
  requireMicrophone: boolean('require_microphone').default(false),
  requireScreenShare: boolean('require_screen_share').default(false),

  // Timing
  perTaskTimeLimit: integer('per_task_time_limit'), // in minutes
  enablePerTaskTimer: boolean('enable_per_task_timer').default(false),
  autoStart: boolean('auto_start').default(false),
  autoEnd: boolean('auto_end').default(true),

  // AI Configuration
  maxHintsAllowed: integer('max_hints_allowed').default(3),
  hintUnlockAfterSubmissions: integer('hint_unlock_after_submissions').default(0),
  hintUnlockAfterSeconds: integer('hint_unlock_after_seconds').default(0),
  provideLastSubmissionContext: boolean('provide_last_submission_context').default(true),

  // Submissions
  maxSubmissionsAllowed: integer('max_submissions_allowed').default(0), // 0 = unlimited
  autoSubmitOnTimeout: boolean('auto_submit_on_timeout').default(true),

  // Extra
  additionalSettings: json('additional_settings').$type<Record<string, any>>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
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

/**
 * Activity Severity Enum
 * Defines the severity level of user activities
 */
export const activitySeverityEnum = pgEnum('activity_severity', ['normal', 'warning', 'alert']);

/**
 * Activity Logs Table
 * Stores real-time user activity during contests
 */
export const activityLogs = pgTable('activity_logs', {
  // Primary key
  id: serial('id').primaryKey(),

  // Contest reference
  contestId: integer('contest_id').notNull().references(() => contests.id, { onDelete: 'cascade' }),

  // User reference
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Activity type (e.g., 'join', 'screen_shift', 'submit', 'hint_request', 'copy_attempt', 'complete')
  activityType: varchar('activity_type', { length: 50 }).notNull(),

  // Additional activity data as JSON
  activityData: jsonb('activity_data'),

  // Severity level
  severity: activitySeverityEnum('severity').notNull().default('normal'),

  // Timestamp when activity occurred
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

/**
 * Contest Settings Table
 * Stores test mode and other settings for contests
 */


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

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;



/**
 * Problems Table
 * Standalone coding problems similar to LeetCode
 * Independent of contests - users can solve anytime
 */
export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),

  // Problem details
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(), // URL-friendly identifier
  description: text('description').notNull(),
  difficulty: contestDifficultyEnum('difficulty').notNull(),

  // Problem metadata
  tags: jsonb('tags'), // e.g., ["array", "dynamic-programming", "graphs"]
  hints: jsonb('hints'), // Array of hints
  companies: jsonb('companies'), // Companies that asked this problem

  // Code template and configuration
  starterCode: jsonb('starter_code'), // { javascript: "...", python: "...", java: "..." }
  functionSignature: jsonb('function_signature'), // Function name, params, return type

  // AI Hints Configuration (same as contest settings)
  maxHintsAllowed: integer('max_hints_allowed').default(3),
  hintUnlockAfterSubmissions: integer('hint_unlock_after_submissions').default(0),
  hintUnlockAfterSeconds: integer('hint_unlock_after_seconds').default(0),
  provideLastSubmissionContext: boolean('provide_last_submission_context').notNull().default(true),
  aiHintsEnabled: boolean('ai_hints_enabled').notNull().default(true),

  // Submission limits
  maxSubmissionsAllowed: integer('max_submissions_allowed').default(0), // 0 = unlimited
  autoSubmitOnTimeout: boolean('auto_submit_on_timeout').notNull().default(true),

  // Test cases stored as JSONB
  testCases: jsonb('test_cases').notNull(), // Public + hidden test cases

  // Statistics
  totalSubmissions: integer('total_submissions').notNull().default(0),
  acceptedSubmissions: integer('accepted_submissions').notNull().default(0),

  // Problem status
  isActive: boolean('is_active').notNull().default(true),
  isPremium: boolean('is_premium').notNull().default(false),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Created by admin
  createdBy: integer('created_by').references(() => users.id),
});

/**
 * Problem Submissions Table
 * Tracks all user submissions for standalone problems
 */
export const problemSubmissions = pgTable('problem_submissions', {
  id: serial('id').primaryKey(),

  // Foreign keys
  problemId: integer('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Submission details
  code: text('code').notNull(),
  language: varchar('language', { length: 50 }).notNull(),

  // Results
  status: varchar('status', { length: 50 }).notNull(), // 'accepted', 'wrong_answer', 'runtime_error', etc.
  testCasesPassed: integer('test_cases_passed').notNull().default(0),
  totalTestCases: integer('total_test_cases').notNull(),

  // Performance metrics
  executionTime: integer('execution_time'), // in milliseconds
  memoryUsed: integer('memory_used'), // in KB

  // Time tracking (how long user took to solve)
  timeSpent: integer('time_spent'), // in seconds (from timer)

  // Error details if any
  errorMessage: text('error_message'),

  // Submission timestamp
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

/**
 * User Problem Progress Table
 * Tracks which problems a user has attempted/solved
 */
export const userProblemProgress = pgTable('user_problem_progress', {
  id: serial('id').primaryKey(),

  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').notNull().references(() => problems.id, { onDelete: 'cascade' }),

  // Status
  status: varchar('status', { length: 50 }).notNull().default('attempted'), // 'attempted', 'solved'

  // Best submission metrics
  bestTime: integer('best_time'), // fastest execution time
  bestMemory: integer('best_memory'), // lowest memory usage

  // Tracking
  attempts: integer('attempts').notNull().default(0),
  firstAttemptAt: timestamp('first_attempt_at').defaultNow().notNull(),
  solvedAt: timestamp('solved_at'),
  lastAttemptAt: timestamp('last_attempt_at').defaultNow().notNull(),
});

export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;

export type ProblemSubmission = typeof problemSubmissions.$inferSelect;
export type NewProblemSubmission = typeof problemSubmissions.$inferInsert;

export type UserProblemProgress = typeof userProblemProgress.$inferSelect;
export type NewUserProblemProgress = typeof userProblemProgress.$inferInsert;

/**
 * AI Hint Usage Tracking Table
 * Tracks how many hints a user has requested for each task/problem
 */
export const aiHintUsage = pgTable('ai_hint_usage', {
  id: serial('id').primaryKey(),

  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Either taskId OR problemId (one will be null)
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  problemId: integer('problem_id').references(() => problems.id, { onDelete: 'cascade' }),
  contestId: integer('contest_id').references(() => contests.id, { onDelete: 'cascade' }),

  // Hint tracking
  hintsRequested: integer('hints_requested').notNull().default(0),
  lastHintAt: timestamp('last_hint_at'),

  // Context for AI
  lastSubmissionCode: text('last_submission_code'),
  lastSubmissionLanguage: varchar('last_submission_language', { length: 50 }),
  lastSubmissionStatus: varchar('last_submission_status', { length: 50 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AiHintUsage = typeof aiHintUsage.$inferSelect;
export type NewAiHintUsage = typeof aiHintUsage.$inferInsert;

/**
 * AI Usage Logs Table
 * Tracks token usage and AI requests for cost monitoring
 */
export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: serial('id').primaryKey(),

  // Context
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  contestId: integer('contest_id').references(() => contests.id, { onDelete: 'set null' }),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'set null' }),

  // AI Details
  provider: varchar('provider', { length: 50 }).notNull(), // 'groq', 'gemini'
  model: varchar('model', { length: 100 }).notNull(),
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'hint', 'solution', 'evaluation'

  // Usage Stats
  tokensUsed: integer('tokens_used').notNull().default(0),

  // Timestamp
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type NewAiUsageLog = typeof aiUsageLogs.$inferInsert;

export type ContestSettings = typeof contestSettings.$inferSelect;
export type NewContestSettings = typeof contestSettings.$inferInsert;

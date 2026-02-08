-- Custom SQL migration file, put your code below! --

-- AI Hint Configuration for Contest Settings
ALTER TABLE "contest_settings" ADD COLUMN "max_hints_allowed" integer DEFAULT 3;
ALTER TABLE "contest_settings" ADD COLUMN "hint_unlock_after_submissions" integer DEFAULT 0;
ALTER TABLE "contest_settings" ADD COLUMN "hint_unlock_after_seconds" integer DEFAULT 0;
ALTER TABLE "contest_settings" ADD COLUMN "provide_last_submission_context" boolean DEFAULT true NOT NULL;

-- Submission Limits for Contest Settings
ALTER TABLE "contest_settings" ADD COLUMN "max_submissions_allowed" integer DEFAULT 0;
ALTER TABLE "contest_settings" ADD COLUMN "auto_submit_on_timeout" boolean DEFAULT true NOT NULL;

-- AI Hint Configuration for Problems
ALTER TABLE "problems" ADD COLUMN "max_hints_allowed" integer DEFAULT 3;
ALTER TABLE "problems" ADD COLUMN "hint_unlock_after_submissions" integer DEFAULT 0;
ALTER TABLE "problems" ADD COLUMN "hint_unlock_after_seconds" integer DEFAULT 0;
ALTER TABLE "problems" ADD COLUMN "provide_last_submission_context" boolean DEFAULT true NOT NULL;
ALTER TABLE "problems" ADD COLUMN "ai_hints_enabled" boolean DEFAULT true NOT NULL;

-- Submission Limits for Problems
ALTER TABLE "problems" ADD COLUMN "max_submissions_allowed" integer DEFAULT 0;
ALTER TABLE "problems" ADD COLUMN "auto_submit_on_timeout" boolean DEFAULT true NOT NULL;

-- AI Hint Usage Tracking Table
CREATE TABLE IF NOT EXISTS "ai_hint_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"task_id" integer,
	"problem_id" integer,
	"contest_id" integer,
	"hints_requested" integer DEFAULT 0 NOT NULL,
	"last_hint_at" timestamp,
	"last_submission_code" text,
	"last_submission_language" varchar(50),
	"last_submission_status" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign keys
ALTER TABLE "ai_hint_usage" ADD CONSTRAINT "ai_hint_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_hint_usage" ADD CONSTRAINT "ai_hint_usage_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_hint_usage" ADD CONSTRAINT "ai_hint_usage_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_hint_usage" ADD CONSTRAINT "ai_hint_usage_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE cascade ON UPDATE no action;
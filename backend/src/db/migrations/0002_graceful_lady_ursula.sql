CREATE TYPE "public"."activity_severity" AS ENUM('normal', 'warning', 'alert');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'processing', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error', 'internal_error');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"activity_data" jsonb,
	"severity" "activity_severity" DEFAULT 'normal' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"contest_id" integer,
	"task_id" integer,
	"provider" varchar(50) NOT NULL,
	"model" varchar(50),
	"purpose" varchar(50) NOT NULL,
	"tokens_used" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"test_mode_enabled" boolean DEFAULT false NOT NULL,
	"ai_hints_enabled" boolean DEFAULT true NOT NULL,
	"ai_mode_enabled" boolean DEFAULT true NOT NULL,
	"full_screen_mode_enabled" boolean DEFAULT true NOT NULL,
	"allow_copy_paste" boolean DEFAULT false NOT NULL,
	"enable_activity_logs" boolean DEFAULT false NOT NULL,
	"per_task_time_limit" integer,
	"enable_per_task_timer" boolean DEFAULT false NOT NULL,
	"auto_start" boolean DEFAULT false NOT NULL,
	"auto_end" boolean DEFAULT true NOT NULL,
	"additional_settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contest_settings_contest_id_unique" UNIQUE("contest_id")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"contest_id" integer NOT NULL,
	"language" varchar(50) NOT NULL,
	"language_id" integer NOT NULL,
	"source_code" text NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"judge0_token" varchar(255),
	"test_results" json,
	"passed_tests" integer DEFAULT 0,
	"total_tests" integer DEFAULT 0,
	"execution_time" integer,
	"memory_used" integer,
	"hints_used" integer DEFAULT 0,
	"used_solution" boolean DEFAULT false,
	"score" integer DEFAULT 0,
	"compile_output" text,
	"stderr" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "test_cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"input" text NOT NULL,
	"expected_output" text NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_task_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"hints_unlocked" integer DEFAULT 0,
	"solution_unlocked" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contest_participants" ADD COLUMN "rank" integer;--> statement-breakpoint
ALTER TABLE "contest_participants" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "contests" ADD COLUMN "scheduled_start_time" timestamp;--> statement-breakpoint
ALTER TABLE "contests" ADD COLUMN "end_time" timestamp;--> statement-breakpoint
ALTER TABLE "contests" ADD COLUMN "full_screen_mode" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "allowed_languages" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "function_name" varchar(255);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "boilerplate_code" json;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "test_runner_template" json;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "ai_config" json DEFAULT '{"hintsEnabled":true,"hintThreshold":2,"solutionThreshold":5}'::json;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_settings" ADD CONSTRAINT "contest_settings_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contests"("id") ON DELETE cascade ON UPDATE no action;
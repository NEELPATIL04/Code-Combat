CREATE TABLE "problem_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"problem_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"code" text NOT NULL,
	"language" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"test_cases_passed" integer DEFAULT 0 NOT NULL,
	"total_test_cases" integer NOT NULL,
	"execution_time" integer,
	"memory_used" integer,
	"time_spent" integer,
	"error_message" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"difficulty" "contest_difficulty" NOT NULL,
	"tags" jsonb,
	"hints" jsonb,
	"companies" jsonb,
	"starter_code" jsonb,
	"function_signature" jsonb,
	"test_cases" jsonb NOT NULL,
	"total_submissions" integer DEFAULT 0 NOT NULL,
	"accepted_submissions" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer,
	CONSTRAINT "problems_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_problem_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"problem_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'attempted' NOT NULL,
	"best_time" integer,
	"best_memory" integer,
	"attempts" integer DEFAULT 0 NOT NULL,
	"first_attempt_at" timestamp DEFAULT now() NOT NULL,
	"solved_at" timestamp,
	"last_attempt_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_problem_progress" ADD CONSTRAINT "user_problem_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_problem_progress" ADD CONSTRAINT "user_problem_progress_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "problems" ADD COLUMN "allowed_languages" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "test_runner_template" jsonb;--> statement-breakpoint
ALTER TABLE "problems" ADD COLUMN "ai_config" jsonb DEFAULT '{"hintsEnabled":true,"hintThreshold":2,"solutionThreshold":5}'::jsonb;
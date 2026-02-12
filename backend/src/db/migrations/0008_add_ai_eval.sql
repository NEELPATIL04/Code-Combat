-- Add AI Evaluation config to tasks table
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "ai_eval_config" json DEFAULT '{"enabled":false,"weight":0,"expectedConcepts":""}';

-- Add AI Evaluation result fields to submissions table
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "ai_eval_score" integer;
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "ai_eval_passed" boolean;
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "ai_eval_feedback" text;
ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "ai_eval_expected" text;

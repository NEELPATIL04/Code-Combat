-- Add contest_state enum type
DO $$ BEGIN
  CREATE TYPE "public"."contest_state" AS ENUM('running', 'paused', 'ended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add contest_state column to contests table
ALTER TABLE "public"."contests" ADD COLUMN IF NOT EXISTS "contest_state" "contest_state" DEFAULT 'running';

-- Add comment
COMMENT ON COLUMN "public"."contests"."contest_state" IS 'Real-time state of an active contest for pause/resume/end control';

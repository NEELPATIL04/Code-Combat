-- Add delete_activity_logs_after_fetch column to contest_settings table
ALTER TABLE "contest_settings" ADD COLUMN "delete_activity_logs_after_fetch" boolean DEFAULT false;

-- Add solution_unlock_after_submissions column to contest_settings table
ALTER TABLE contest_settings 
ADD COLUMN IF NOT EXISTS solution_unlock_after_submissions INTEGER DEFAULT 0;

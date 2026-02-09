-- Update existing active contests to have contestState = 'running'
UPDATE contests
SET contest_state = 'running'
WHERE status = 'active' AND contest_state IS NULL;

-- Update existing non-active contests to have contestState = 'running' as well
-- (they'll change when they become active)
UPDATE contests
SET contest_state = 'running'
WHERE contest_state IS NULL;

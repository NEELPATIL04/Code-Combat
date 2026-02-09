-- Fixed SQL script matching actual schema
-- Fixes String Concatenation and creates test contest

-- Step 1: Fix String Concatenation task with proper wrapper templates
UPDATE tasks
SET
  function_name = 'concatenateStrings',
  boilerplate_code = '{
    "javascript": "function concatenateStrings(str1, str2) {\n  // Write your code here\n  return \"\";\n}",
    "python": "def concatenate_strings(str1, str2):\n    # Write your code here\n    return \"\"",
    "java": "class Solution {\n    public String concatenateStrings(String str1, String str2) {\n        // Write your code here\n        return \"\";\n    }\n}",
    "cpp": "#include <string>\nusing namespace std;\n\nstring concatenateStrings(string str1, string str2) {\n    // Write your code here\n    return \"\";\n}"
  }'::json,
  test_runner_template = '{
    "javascript": "{{USER_CODE}}\n\n// Test runner\nconst fs = require(\"fs\");\nconst input = fs.readFileSync(0, \"utf-8\").trim().split(\"\\n\");\nconst str1 = input[0] || \"\";\nconst str2 = input[1] || \"\";\nconst result = {{FUNCTION_CALL}};\nconsole.log(result);",
    "python": "import sys\n\n{{USER_CODE}}\n\n# Test runner\ninput_lines = sys.stdin.read().strip().split(\"\\n\")\nstr1 = input_lines[0] if len(input_lines) > 0 else \"\"\nstr2 = input_lines[1] if len(input_lines) > 1 else \"\"\nresult = {{FUNCTION_CALL}}\nprint(result)"
  }'::json
WHERE title ILIKE '%string%concat%';

-- Step 2: Create Test Contest
INSERT INTO contests (title, description, difficulty, duration, created_by, scheduled_start_time, end_time)
VALUES (
  'Claude Test Contest - Boilerplate Testing',
  'Test contest to verify boilerplate and wrapper code functionality. Created by Claude for testing purposes.',
  'Easy',
  120,
  (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1),
  NOW(),
  NOW() + INTERVAL '7 days'
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Get contest ID for next steps
-- Run this separately to get the ID:
-- SELECT id FROM contests WHERE title = 'Claude Test Contest - Boilerplate Testing';

-- Step 3: Create Task 1 - Two Sum
DO $$
DECLARE
  contest_id_var integer;
  task_id_var integer;
BEGIN
  -- Get contest ID
  SELECT id INTO contest_id_var FROM contests WHERE title = 'Claude Test Contest - Boilerplate Testing' LIMIT 1;

  IF contest_id_var IS NOT NULL THEN
    -- Insert task
    INSERT INTO tasks (
      contest_id, title, description, difficulty, max_points, order_index,
      function_name, allowed_languages, boilerplate_code, test_runner_template
    )
    VALUES (
      contest_id_var,
      'Two Sum',
      E'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
      'Easy',
      100,
      1,
      'twoSum',
      '["javascript", "python"]'::json,
      '{
        "javascript": "function twoSum(nums, target) {\n  // Write your code here\n  return [];\n}",
        "python": "def two_sum(nums, target):\n    # Write your code here\n    return []"
      }'::json,
      '{
        "javascript": "{{USER_CODE}}\n\n// Test runner\nconst testInput = {{TEST_INPUT}};\nconst result = {{FUNCTION_CALL}};\nconsole.log(JSON.stringify(result));",
        "python": "import json\n\n{{USER_CODE}}\n\n# Test runner\ntest_input = {{TEST_INPUT}}\nresult = {{FUNCTION_CALL}}\nprint(json.dumps(result))"
      }'::json
    )
    RETURNING id INTO task_id_var;

    -- Insert test cases
    INSERT INTO test_cases (task_id, input, expected_output, is_hidden, order_index)
    VALUES
      (task_id_var, '[[2,7,11,15], 9]', '[0,1]', false, 1),
      (task_id_var, '[[3,2,4], 6]', '[1,2]', false, 2),
      (task_id_var, '[[3,3], 6]', '[0,1]', true, 3);

    RAISE NOTICE 'Created Two Sum task with ID: %', task_id_var;
  END IF;
END $$;

-- Step 4: Create Task 2 - Reverse String
DO $$
DECLARE
  contest_id_var integer;
  task_id_var integer;
BEGIN
  SELECT id INTO contest_id_var FROM contests WHERE title = 'Claude Test Contest - Boilerplate Testing' LIMIT 1;

  IF contest_id_var IS NOT NULL THEN
    INSERT INTO tasks (
      contest_id, title, description, difficulty, max_points, order_index,
      function_name, allowed_languages, boilerplate_code, test_runner_template
    )
    VALUES (
      contest_id_var,
      'Reverse String',
      E'Write a function that reverses a string.\n\nExample:\nInput: "hello"\nOutput: "olleh"',
      'Easy',
      50,
      2,
      'reverseString',
      '["javascript", "python"]'::json,
      '{
        "javascript": "function reverseString(str) {\n  // Write your code here\n  return \"\";\n}",
        "python": "def reverse_string(str):\n    # Write your code here\n    return \"\""
      }'::json,
      '{
        "javascript": "{{USER_CODE}}\n\n// Test runner\nconst testInput = {{TEST_INPUT}};\nconst result = {{FUNCTION_CALL}};\nconsole.log(result);",
        "python": "{{USER_CODE}}\n\n# Test runner\ntest_input = {{TEST_INPUT}}\nresult = {{FUNCTION_CALL}}\nprint(result)"
      }'::json
    )
    RETURNING id INTO task_id_var;

    INSERT INTO test_cases (task_id, input, expected_output, is_hidden, order_index)
    VALUES
      (task_id_var, '["hello"]', 'olleh', false, 1),
      (task_id_var, '["world"]', 'dlrow', false, 2),
      (task_id_var, '[""]', '', true, 3);

    RAISE NOTICE 'Created Reverse String task with ID: %', task_id_var;
  END IF;
END $$;

-- Step 5: Configure contest settings
DO $$
DECLARE
  contest_id_var integer;
BEGIN
  SELECT id INTO contest_id_var FROM contests WHERE title = 'Claude Test Contest - Boilerplate Testing' LIMIT 1;

  IF contest_id_var IS NOT NULL THEN
    INSERT INTO contest_settings (
      contest_id, ai_hints_enabled, max_hints_allowed, hint_unlock_after_submissions
    )
    VALUES (
      contest_id_var, true, 3, 2
    )
    ON CONFLICT (contest_id) DO UPDATE SET
      ai_hints_enabled = true,
      max_hints_allowed = 3,
      hint_unlock_after_submissions = 2;

    RAISE NOTICE 'Configured contest settings for contest ID: %', contest_id_var;
  END IF;
END $$;

-- Step 6: Verification query
SELECT
  c.id as contest_id,
  c.title as contest_title,
  c.status,
  t.id as task_id,
  t.title as task_title,
  t.function_name,
  t.max_points,
  COUNT(tc.id) as test_case_count
FROM contests c
LEFT JOIN tasks t ON t.contest_id = c.id
LEFT JOIN test_cases tc ON tc.task_id = t.id
WHERE c.title = 'Claude Test Contest - Boilerplate Testing'
GROUP BY c.id, c.title, c.status, t.id, t.title, t.function_name, t.max_points
ORDER BY t.order_index;

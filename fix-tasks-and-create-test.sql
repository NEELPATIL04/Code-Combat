-- Fix String Concatenation Task with proper wrapper templates
-- This fixes the hardcoded 'solution' function name issue

-- First, let's see what tasks exist
-- SELECT id, title, function_name FROM tasks WHERE title ILIKE '%concat%';

-- Update String Concatenation task with proper templates
UPDATE tasks
SET
  function_name = 'concatenate',
  boilerplate_code = jsonb_build_object(
    'javascript', 'function concatenate(str1, str2) {
  // Write your code here
  return "";
}',
    'python', 'def concatenate(str1, str2):
    # Write your code here
    return ""',
    'java', 'class Solution {
    public String concatenate(String str1, String str2) {
        // Write your code here
        return "";
    }
}',
    'cpp', '#include <string>
using namespace std;

string concatenate(string str1, string str2) {
    // Write your code here
    return "";
}'
  ),
  test_runner_template = jsonb_build_object(
    'javascript', '{{USER_CODE}}

// Test runner
const input = require("fs").readFileSync(0, "utf-8").trim().split("\n");
const str1 = input[0];
const str2 = input[1];
const result = {{FUNCTION_CALL}};
console.log(result);',
    'python', 'import sys

{{USER_CODE}}

# Test runner
input_lines = sys.stdin.read().strip().split("\n")
str1 = input_lines[0] if len(input_lines) > 0 else ""
str2 = input_lines[1] if len(input_lines) > 1 else ""
result = {{FUNCTION_CALL}}
print(result)',
    'java', 'import java.util.Scanner;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String str1 = scanner.hasNextLine() ? scanner.nextLine() : "";
        String str2 = scanner.hasNextLine() ? scanner.nextLine() : "";
        Solution solution = new Solution();
        String result = {{FUNCTION_CALL}};
        System.out.println(result);
    }
}',
    'cpp', '#include <iostream>
#include <string>
using namespace std;

{{USER_CODE}}

int main() {
    string str1, str2;
    getline(cin, str1);
    getline(cin, str2);
    string result = {{FUNCTION_CALL}};
    cout << result << endl;
    return 0;
}'
  )
WHERE title ILIKE '%string%concat%';

-- Create a Test Contest for Claude
INSERT INTO contests (title, description, start_time, end_time, duration, created_by)
VALUES (
  'Claude Test Contest',
  'Test contest to verify boilerplate and wrapper code functionality',
  NOW(),
  NOW() + INTERVAL '7 days',
  120,
  (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1)
) ON CONFLICT DO NOTHING
RETURNING id;

-- Get the contest ID (you'll need to run this separately or note the ID from above)
-- Then create test tasks

-- Task 1: Two Sum (Simple Array Problem)
INSERT INTO tasks (contest_id, title, description, difficulty, points, function_name, boilerplate_code, test_runner_template)
VALUES (
  (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1),
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
  'easy',
  10,
  'twoSum',
  jsonb_build_object(
    'javascript', 'function twoSum(nums, target) {
  // Write your code here
  return [];
}',
    'python', 'def two_sum(nums, target):
    # Write your code here
    return []'
  ),
  jsonb_build_object(
    'javascript', '{{USER_CODE}}

// Test runner
const testInput = {{TEST_INPUT}};
const result = {{FUNCTION_CALL}};
console.log(JSON.stringify(result));',
    'python', 'import json

{{USER_CODE}}

# Test runner
test_input = {{TEST_INPUT}}
result = {{FUNCTION_CALL}}
print(json.dumps(result))'
  )
) RETURNING id;

-- Add test cases for Two Sum
INSERT INTO test_cases (task_id, input, expected_output, is_hidden, order_index)
VALUES
  ((SELECT id FROM tasks WHERE title = 'Two Sum' AND contest_id = (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1) LIMIT 1),
   '[[2,7,11,15], 9]', '[0,1]', false, 1),
  ((SELECT id FROM tasks WHERE title = 'Two Sum' AND contest_id = (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1) LIMIT 1),
   '[[3,2,4], 6]', '[1,2]', false, 2),
  ((SELECT id FROM tasks WHERE title = 'Two Sum' AND contest_id = (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1) LIMIT 1),
   '[[3,3], 6]', '[0,1]', true, 3);

-- Task 2: Reverse String (String Problem)
INSERT INTO tasks (contest_id, title, description, difficulty, points, function_name, boilerplate_code, test_runner_template)
VALUES (
  (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1),
  'Reverse String',
  'Write a function that reverses a string.

Example:
Input: "hello"
Output: "olleh"',
  'easy',
  5,
  'reverseString',
  jsonb_build_object(
    'javascript', 'function reverseString(str) {
  // Write your code here
  return "";
}',
    'python', 'def reverse_string(str):
    # Write your code here
    return ""'
  ),
  jsonb_build_object(
    'javascript', '{{USER_CODE}}

// Test runner
const testInput = {{TEST_INPUT}};
const result = {{FUNCTION_CALL}};
console.log(result);',
    'python', '{{USER_CODE}}

# Test runner
test_input = {{TEST_INPUT}}
result = {{FUNCTION_CALL}}
print(result)'
  )
) RETURNING id;

-- Add test cases for Reverse String
INSERT INTO test_cases (task_id, input, expected_output, is_hidden, order_index)
VALUES
  ((SELECT id FROM tasks WHERE title = 'Reverse String' AND contest_id = (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1) LIMIT 1),
   '["hello"]', 'olleh', false, 1),
  ((SELECT id FROM tasks WHERE title = 'Reverse String' AND contest_id = (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1) LIMIT 1),
   '["world"]', 'dlrow', false, 2),
  ((SELECT id FROM tasks WHERE title = 'Reverse String' AND contest_id = (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1) LIMIT 1),
   '[""]', '', true, 3);

-- Enable AI hints for the test contest
INSERT INTO contest_settings (contest_id, ai_hints_enabled, max_hints_allowed, hint_unlock_after_submissions)
VALUES (
  (SELECT id FROM contests WHERE title = 'Claude Test Contest' LIMIT 1),
  true,
  3,
  2
) ON CONFLICT (contest_id) DO UPDATE SET
  ai_hints_enabled = true,
  max_hints_allowed = 3,
  hint_unlock_after_submissions = 2;

-- Summary query to verify
SELECT
  c.id as contest_id,
  c.title as contest_title,
  t.id as task_id,
  t.title as task_title,
  t.function_name,
  jsonb_object_keys(t.boilerplate_code) as boilerplate_languages,
  jsonb_object_keys(t.test_runner_template) as template_languages,
  COUNT(tc.id) as test_case_count
FROM contests c
LEFT JOIN tasks t ON t.contest_id = c.id
LEFT JOIN test_cases tc ON tc.task_id = t.id
WHERE c.title = 'Claude Test Contest'
GROUP BY c.id, c.title, t.id, t.title, t.function_name, t.boilerplate_code, t.test_runner_template
ORDER BY t.id;

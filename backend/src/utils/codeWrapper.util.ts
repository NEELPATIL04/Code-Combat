/**
 * Code Wrapper Utility
 * Wraps user code with boilerplate and test runner code for Judge0 execution
 */

/**
 * Default boilerplate templates for different languages
 * These are shown to the user in the editor
 */
export const DEFAULT_BOILERPLATES: Record<string, Record<string, string>> = {
  twoSum: {
    javascript: `function twoSum(nums, target) {
    // Write your code here
    return [];
}`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
    // Write your code here
    return [];
}`,
    python: `def two_sum(nums, target):
    # Write your code here
    return []`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}`,
    cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        return {};
    }
};`,
  },
};

/**
 * Default test runner templates
 * These wrap the user's code and call the function with test inputs
 *
 * Placeholders:
 * - {{USER_CODE}} - replaced with user's code
 * - {{FUNCTION_NAME}} - replaced with function name
 * - {{TEST_INPUT}} - replaced with test case input
 */
export const DEFAULT_TEST_RUNNERS: Record<string, string> = {
  javascript: `{{USER_CODE}}

// Test runner
const testInput = {{TEST_INPUT}};
const result = {{FUNCTION_CALL}};
console.log(JSON.stringify(result));`,

  typescript: `{{USER_CODE}}

// Test runner
const testInput: any = {{TEST_INPUT}};
const result = {{FUNCTION_CALL}};
console.log(JSON.stringify(result));`,

  python: `import json

{{USER_CODE}}

# Test runner
test_input = {{TEST_INPUT}}
result = {{FUNCTION_CALL}}
print(json.dumps(result))`,

  java: `import java.util.*;
import com.google.gson.Gson;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        Gson gson = new Gson();

        // Test runner
        Object testInput = {{TEST_INPUT}};
        Object result = {{FUNCTION_CALL}};
        System.out.println(gson.toJson(result));
    }
}`,

  cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

{{USER_CODE}}

int main() {
    Solution solution;

    // Test runner
    auto result = {{FUNCTION_CALL}};

    // Print result (simplified JSON output)
    cout << "[";
    for(size_t i = 0; i < result.size(); i++) {
        if(i > 0) cout << ",";
        cout << result[i];
    }
    cout << "]" << endl;

    return 0;
}`,
};

/**
 * Parse test input string and convert to function call
 * Example: "nums = [2,7,11,15], target = 9"
 * Returns: { params: "[2,7,11,15], 9", values: [[2,7,11,15], 9] }
 */
export function parseTestInput(input: string): {
  params: string;
  values: any[];
} {
  try {
    // Try to parse as JSON array first
    const jsonMatch = input.match(/^\[(.*)\]$/s);
    if (jsonMatch) {
      const values = JSON.parse(input);
      return {
        params: values.map((v: any) => JSON.stringify(v)).join(', '),
        values,
      };
    }

    // Parse "param1 = value1, param2 = value2" format
    const parts = input.split(',').map(s => s.trim());
    const values: any[] = [];
    const params: string[] = [];

    for (const part of parts) {
      const match = part.match(/^(\w+)\s*=\s*(.+)$/);
      if (match) {
        const value = match[2].trim();
        try {
          const parsed = JSON.parse(value);
          values.push(parsed);
          params.push(JSON.stringify(parsed));
        } catch {
          values.push(value);
          params.push(value);
        }
      } else {
        // No "=" found, treat whole part as value
        try {
          const parsed = JSON.parse(part);
          values.push(parsed);
          params.push(JSON.stringify(parsed));
        } catch {
          values.push(part);
          params.push(part);
        }
      }
    }

    return {
      params: params.join(', '),
      values,
    };
  } catch (error) {
    console.error('Error parsing test input:', error);
    return {
      params: input,
      values: [input],
    };
  }
}

/**
 * Generate function call string for different languages
 */
export function generateFunctionCall(
  functionName: string,
  params: string,
  language: string
): string {
  switch (language) {
    case 'python':
      return `${functionName}(${params})`;

    case 'java':
      return `solution.${functionName}(${params})`;

    case 'cpp':
      return `solution.${functionName}(${params})`;

    default: // javascript, typescript
      return `${functionName}(${params})`;
  }
}

/**
 * Wrap user code with test runner
 */
export function wrapCodeWithTestRunner(params: {
  userCode: string;
  language: string;
  functionName?: string;
  testInput?: string;
  testRunnerTemplate?: string;
}): string {
  const { userCode, language, functionName, testInput, testRunnerTemplate } = params;

  // If no function name or test input, return user code as-is
  if (!functionName || !testInput) {
    return userCode;
  }

  // Get test runner template
  const template = testRunnerTemplate || DEFAULT_TEST_RUNNERS[language];
  if (!template) {
    console.warn(`No test runner template for language: ${language}`);
    return userCode;
  }

  // Parse test input
  const { params: functionParams } = parseTestInput(testInput);

  // Generate function call
  const functionCall = generateFunctionCall(functionName, functionParams, language);

  // Replace placeholders
  let wrappedCode = template
    .replace('{{USER_CODE}}', userCode)
    .replace('{{FUNCTION_NAME}}', functionName)
    .replace('{{FUNCTION_CALL}}', functionCall)
    .replace('{{TEST_INPUT}}', testInput);

  return wrappedCode;
}

/**
 * Get default boilerplate for a language
 */
export function getDefaultBoilerplate(
  language: string,
  functionName: string = 'twoSum'
): string {
  return DEFAULT_BOILERPLATES[functionName]?.[language] || `// Write your ${language} code here\n`;
}

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
    const trimmed = input.trim();

    // Try to parse as JSON array first
    const jsonMatch = trimmed.match(/^\[(.*)\]$/s);
    if (jsonMatch) {
      const values = JSON.parse(trimmed);
      return {
        params: values.map((v: any) => JSON.stringify(v)).join(', '),
        values,
      };
    }

    // Parse "param1 = value1, param2 = value2" format
    const parts: string[] = [];
    const values: any[] = [];
    const params: string[] = [];

    // Smart splitting that respects brackets and braces
    let current = '';
    let bracketDepth = 0;
    let braceDepth = 0;

    for (const char of trimmed) {
      if (char === '[') bracketDepth++;
      if (char === ']') bracketDepth--;
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
      
      if (char === ',' && bracketDepth === 0 && braceDepth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) parts.push(current.trim());

    // Parse each part
    for (const part of parts) {
      const eqIndex = part.indexOf('=');
      let value: string;

      if (eqIndex > -1) {
        // Has "=" separator
        value = part.substring(eqIndex + 1).trim();
      } else {
        // No "=" found, treat whole part as value
        value = part;
      }

      try {
        const parsed = JSON.parse(value);
        values.push(parsed);
        params.push(JSON.stringify(parsed));
      } catch {
        // If JSON parse fails, treat as string literal
        values.push(value);
        params.push(`"${value}"`);
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
    console.warn('wrapCodeWithTestRunner: Missing functionName or testInput', { functionName, testInput: testInput ? 'present' : 'missing' });
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

  // Replace placeholders in order
  let wrappedCode = template
    .replace(/\{\{USER_CODE\}\}/g, userCode)
    .replace(/\{\{FUNCTION_NAME\}\}/g, functionName)
    .replace(/\{\{FUNCTION_CALL\}\}/g, functionCall)
    .replace(/\{\{TEST_INPUT\}\}/g, testInput);

  console.log('✅ Code wrapped successfully', {
    language,
    functionName,
    testInputLength: testInput.length,
    hasUserCode: !!userCode,
    wrappedCodeLength: wrappedCode.length,
  });

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

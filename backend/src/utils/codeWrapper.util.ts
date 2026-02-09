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
const result = {{FUNCTION_CALL}};
console.log(JSON.stringify(result));`,

  typescript: `{{USER_CODE}}

// Test runner
const result = {{FUNCTION_CALL}};
console.log(JSON.stringify(result));`,

  python: `import json

{{USER_CODE}}

# Test runner
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
 * Find the index of the matching closing brace for an opening brace.
 * Handles nested braces and skips braces inside string literals and comments.
 */
function findMatchingBrace(code: string, openBraceIndex: number): number {
  let depth = 1;
  let inString = false;
  let stringChar = '';

  for (let i = openBraceIndex + 1; i < code.length; i++) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : '';

    // Handle string literals
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (inString) continue;

    // Handle single-line comments
    if (char === '/' && i + 1 < code.length && code[i + 1] === '/') {
      const newlineIdx = code.indexOf('\n', i);
      if (newlineIdx !== -1) i = newlineIdx;
      continue;
    }

    // Handle multi-line comments
    if (char === '/' && i + 1 < code.length && code[i + 1] === '*') {
      const endComment = code.indexOf('*/', i + 2);
      if (endComment !== -1) i = endComment + 1;
      continue;
    }

    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Merge user code with a stdin-based driver template.
 * Used when the template doesn't have {{USER_CODE}} placeholder.
 */
function mergeUserCodeWithDriverTemplate(
  userCode: string,
  template: string,
  language: string,
  functionName: string
): string {
  console.log('🔀 Merging user code with driver template (no {{USER_CODE}} placeholder):', { language, functionName });

  switch (language) {
    case 'java':
      return mergeJavaCode(userCode, template, functionName);
    case 'cpp':
    case 'c':
      return mergeCppCode(userCode, template, functionName);
    default:
      // For JS, TS, Python, and other scripting languages: prepend user code
      console.log('📝 Prepending user code for', language);
      return userCode + '\n\n' + template;
  }
}

/**
 * Merge Java user code with driver template.
 * Extracts user's solution method and injects it into the template class,
 * replacing any stub method.
 */
function mergeJavaCode(userCode: string, template: string, functionName: string): string {
  try {
    console.log('☕ Merging Java code...');

    // Build regex to find the solution method
    const methodPattern = new RegExp(
      `((?:public\\s+)?(?:static\\s+)?[\\w<>\\[\\]]+\\s+${functionName}\\s*\\([^)]*\\))\\s*\\{`,
      's'
    );

    // Extract user's solution method (full signature + body)
    const userMethodMatch = userCode.match(methodPattern);
    if (!userMethodMatch) {
      console.warn('⚠️  Could not find user method in Java code, using prepend fallback');
      return userCode + '\n\n' + template;
    }

    const methodSigStart = userCode.indexOf(userMethodMatch[0]);
    const braceStart = userCode.indexOf('{', methodSigStart + userMethodMatch[1].length);
    const braceEnd = findMatchingBrace(userCode, braceStart);
    if (braceEnd === -1) {
      console.warn('⚠️  Could not find matching brace in user Java code');
      return userCode + '\n\n' + template;
    }
    const userMethod = userCode.substring(methodSigStart, braceEnd + 1).trim();

    // Collect imports from both user code and template, deduplicate
    const userImports = userCode.split('\n').filter(l => l.trim().startsWith('import ')).map(l => l.trim());
    const templateImports = template.split('\n').filter(l => l.trim().startsWith('import ')).map(l => l.trim());
    const allImports = [...new Set([...templateImports, ...userImports])];

    // Find and replace the stub method in template
    const templateMethodMatch = template.match(methodPattern);
    if (templateMethodMatch) {
      const tmplSigStart = template.indexOf(templateMethodMatch[0]);
      const tmplBraceStart = template.indexOf('{', tmplSigStart + templateMethodMatch[1].length);
      const tmplBraceEnd = findMatchingBrace(template, tmplBraceStart);
      if (tmplBraceEnd !== -1) {
        let result = template.substring(0, tmplSigStart) + '  ' + userMethod + template.substring(tmplBraceEnd + 1);
        // Re-add merged imports at top
        const resultNoImports = result.split('\n').filter(l => !l.trim().startsWith('import ')).join('\n').trimStart();
        result = allImports.join('\n') + '\n\n' + resultNoImports;
        console.log('✅ Java merge successful (replaced stub method)');
        return result;
      }
    }

    // No stub found — inject user method before closing brace of template class
    const lastBrace = template.lastIndexOf('}');
    if (lastBrace !== -1) {
      let result = template.substring(0, lastBrace) + '\n  ' + userMethod + '\n}';
      const resultNoImports = result.split('\n').filter(l => !l.trim().startsWith('import ')).join('\n').trimStart();
      result = allImports.join('\n') + '\n\n' + resultNoImports;
      console.log('✅ Java merge successful (injected before closing brace)');
      return result;
    }

    return userCode + '\n\n' + template;
  } catch (e) {
    console.error('❌ Java merge failed:', e);
    return userCode + '\n\n' + template;
  }
}

/**
 * Merge C++ user code with driver template.
 * Replaces the Solution class stub in the template with the user's Solution class.
 */
function mergeCppCode(userCode: string, template: string, functionName: string): string {
  try {
    console.log('🔧 Merging C++ code...');

    const templateClassIdx = template.indexOf('class Solution');
    const userClassIdx = userCode.indexOf('class Solution');

    if (templateClassIdx === -1 || userClassIdx === -1) {
      console.log('📝 No Solution class found in both, using prepend');
      return userCode + '\n\n' + template;
    }

    // Find template's Solution class boundaries: class Solution { ... };
    const tmplBraceStart = template.indexOf('{', templateClassIdx);
    if (tmplBraceStart === -1) return userCode + '\n\n' + template;
    const tmplBraceEnd = findMatchingBrace(template, tmplBraceStart);
    if (tmplBraceEnd === -1) return userCode + '\n\n' + template;
    const tmplClassEnd = template.indexOf(';', tmplBraceEnd);
    if (tmplClassEnd === -1) return userCode + '\n\n' + template;

    // Extract user's Solution class
    const userBraceStart = userCode.indexOf('{', userClassIdx);
    if (userBraceStart === -1) return userCode + '\n\n' + template;
    const userBraceEnd = findMatchingBrace(userCode, userBraceStart);
    if (userBraceEnd === -1) return userCode + '\n\n' + template;
    const userClassEnd = userCode.indexOf(';', userBraceEnd);
    if (userClassEnd === -1) return userCode + '\n\n' + template;

    // Get any includes/using from user code (before class)
    const userPrefix = userCode.substring(0, userClassIdx).trim();
    const userClass = userCode.substring(userClassIdx, userClassEnd + 1);

    // Replace template's Solution class with user's
    let result = template.substring(0, templateClassIdx);
    if (userPrefix) result += userPrefix + '\n\n';
    result += userClass + template.substring(tmplClassEnd + 1);

    console.log('✅ C++ merge successful (replaced Solution class)');
    return result;
  } catch (e) {
    console.error('❌ C++ merge failed:', e);
    return userCode + '\n\n' + template;
  }
}

/**
 * Wrap user code with test runner.
 * Supports two template styles:
 *   Style A (placeholder-based): Uses {{USER_CODE}}, {{FUNCTION_CALL}}, {{TEST_INPUT}}
 *   Style B (stdin-based driver): No placeholders — reads input from stdin, calls function by name
 */
export function wrapCodeWithTestRunner(params: {
  userCode: string;
  language: string;
  functionName?: string;
  testInput?: string;
  testRunnerTemplate?: string;
}): string {
  const { userCode, language, functionName, testInput, testRunnerTemplate } = params;

  console.log('🔧 wrapCodeWithTestRunner called:', {
    language,
    functionName: functionName || 'MISSING',
    hasUserCode: !!userCode,
    userCodeLength: userCode?.length || 0,
    hasTestInput: testInput !== undefined && testInput !== null,
    testInputPreview: testInput?.substring(0, 100) ?? 'MISSING',
    hasCustomTemplate: !!testRunnerTemplate,
  });

  // If no function name, return user code as-is
  // NOTE: testInput CAN be empty string (valid input), so only check for undefined/null
  if (!functionName || testInput === undefined || testInput === null) {
    console.warn('⚠️  wrapCodeWithTestRunner: Missing functionName or testInput - returning unwrapped code', {
      functionName: functionName || 'MISSING',
      testInput: testInput !== undefined && testInput !== null ? 'present' : 'MISSING'
    });
    return userCode;
  }

  // Get test runner template (custom from DB or default)
  const template = testRunnerTemplate || DEFAULT_TEST_RUNNERS[language];
  if (!template) {
    console.warn(`⚠️  No test runner template for language: ${language} - returning unwrapped code`);
    return userCode;
  }

  // Check which template style we have
  const hasUserCodePlaceholder = template.includes('{{USER_CODE}}');

  if (hasUserCodePlaceholder) {
    // ── STYLE A: Placeholder-based template ──
    console.log('✅ Using placeholder-based template (Style A)');

    const { params: functionParams } = parseTestInput(testInput);
    const functionCall = generateFunctionCall(functionName, functionParams, language);

    console.log('📝 Function call:', functionCall);

    const wrappedCode = template
      .replace(/\{\{USER_CODE\}\}/g, userCode)
      .replace(/\{\{FUNCTION_NAME\}\}/g, functionName)
      .replace(/\{\{FUNCTION_CALL\}\}/g, functionCall)
      .replace(/\{\{TEST_INPUT\}\}/g, testInput);

    console.log('✅ Code wrapped (Style A):', {
      wrappedCodeLength: wrappedCode.length,
      wrappedCodePreview: wrappedCode.substring(0, 300) + '...',
    });
    return wrappedCode;

  } else {
    // ── STYLE B: Stdin-based driver template (no {{USER_CODE}}) ──
    console.log('🔀 Using stdin-based driver template (Style B) — merging user code');

    const mergedCode = mergeUserCodeWithDriverTemplate(userCode, template, language, functionName);

    console.log('✅ Code merged (Style B):', {
      mergedCodeLength: mergedCode.length,
      mergedCodePreview: mergedCode.substring(0, 300) + '...',
    });
    return mergedCode;
  }
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

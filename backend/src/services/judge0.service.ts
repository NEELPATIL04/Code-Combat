import axios from 'axios';
import { getJudge0LanguageId, Judge0Submission, Judge0Result } from '../utils/judge0.util';
import { wrapCodeWithTestRunner, DEFAULT_TEST_RUNNERS, RESULT_DELIMITER } from '../utils/codeWrapper.util';

/**
 * Split stdout into user console output and actual test result.
 * If the delimiter is present, everything before it is console output,
 * and everything after it is the actual result.
 * If no delimiter, the entire stdout is treated as the result (backward compatible).
 */
function parseStdout(stdout: string | null): { consoleOutput: string; actualResult: string } {
  if (!stdout) return { consoleOutput: '', actualResult: '' };

  const delimiterStr = RESULT_DELIMITER.trim();
  const idx = stdout.indexOf(delimiterStr);

  if (idx === -1) {
    // No delimiter found — treat entire output as result (backward compatible)
    return { consoleOutput: '', actualResult: stdout.trim() };
  }

  const consoleOutput = stdout.substring(0, idx).trim();
  const actualResult = stdout.substring(idx + delimiterStr.length).trim();

  return { consoleOutput, actualResult };
}

// ═══════════════════════════════════════════════════════
// ERROR FORMATTING — User-friendly error messages
// ═══════════════════════════════════════════════════════

/**
 * Error type classification with emoji + actionable suggestion
 */
const ERROR_CLASSIFICATIONS: Record<string, { label: string; emoji: string; suggestion: string }> = {
  compilation_error: {
    label: 'Compilation Error',
    emoji: '🔴',
    suggestion: 'Check your syntax — look for missing brackets, semicolons, or typos.',
  },
  syntax_error: {
    label: 'Syntax Error',
    emoji: '🔴',
    suggestion: 'You have a syntax mistake. Check for missing parentheses, brackets, or semicolons near the indicated line.',
  },
  type_error: {
    label: 'Type Error',
    emoji: '🟠',
    suggestion: 'You\'re using a value incorrectly — check that all variables and methods exist and are the right type.',
  },
  reference_error: {
    label: 'Reference Error',
    emoji: '🟠',
    suggestion: 'You\'re using a variable or function that doesn\'t exist. Check for typos in variable names.',
  },
  runtime_error: {
    label: 'Runtime Error',
    emoji: '🟠',
    suggestion: 'Your code crashed during execution. Check for null/undefined access, array out-of-bounds, or division by zero.',
  },
  index_out_of_bounds: {
    label: 'Index Out of Bounds',
    emoji: '🟠',
    suggestion: 'You\'re accessing an array/list index that doesn\'t exist. Check your loop bounds and array lengths.',
  },
  null_pointer: {
    label: 'Null Pointer Error',
    emoji: '🟠',
    suggestion: 'You\'re trying to use a null or undefined value. Check that all objects are properly initialized.',
  },
  stack_overflow: {
    label: 'Stack Overflow',
    emoji: '🔴',
    suggestion: 'Your code has infinite recursion. Make sure recursive functions have a proper base case.',
  },
  time_limit_exceeded: {
    label: 'Time Limit Exceeded',
    emoji: '⏱️',
    suggestion: 'Your code took too long. Optimize your algorithm or check for infinite loops.',
  },
  memory_limit_exceeded: {
    label: 'Memory Limit Exceeded',
    emoji: '💾',
    suggestion: 'Your code used too much memory. Check for large unnecessary data structures or infinite growth.',
  },
  internal_error: {
    label: 'Internal Error',
    emoji: '⚙️',
    suggestion: 'An internal system error occurred. Please try submitting again.',
  },
};

/**
 * Classify the specific error type from the raw error text
 */
function classifyError(statusId: number, rawError: string, language: string): string {
  const lower = rawError.toLowerCase();

  // Status-based classification first
  if (statusId === 5) return 'time_limit_exceeded';
  if (statusId === 6) {
    // Compilation error — check for more specific types
    if (language === 'typescript' && lower.includes('error ts')) return 'compilation_error';
    return 'compilation_error';
  }
  if (statusId === 13 || statusId === 14) return 'internal_error';

  // Content-based classification for runtime errors (status 7-12, or status 3/4 with stderr)
  if (lower.includes('syntaxerror')) return 'syntax_error';
  if (lower.includes('typeerror') || lower.includes('is not a function') || lower.includes('is not a constructor')) return 'type_error';
  if (lower.includes('referenceerror') || lower.includes('is not defined')) return 'reference_error';
  if (lower.includes('rangeerror') || lower.includes('stack overflow') || lower.includes('maximum call stack')) return 'stack_overflow';
  if (lower.includes('outofbounds') || lower.includes('out of bounds') || lower.includes('out_of_range') || lower.includes('indexerror')) return 'index_out_of_bounds';
  if (lower.includes('nullpointer') || lower.includes('null pointer') || lower.includes('cannot read properties of null') || lower.includes('cannot read property')) return 'null_pointer';

  // Default based on status
  if (statusId >= 7 && statusId <= 12) return 'runtime_error';
  return 'runtime_error';
}

/**
 * Clean up and extract the meaningful part of an error message.
 * Strips internal paths, long stack traces, and sandbox artifacts.
 */
function cleanErrorText(rawError: string, language: string): string {
  let lines = rawError.split('\n');

  if (language === 'javascript' || language === 'typescript') {
    // Strip Node.js internal stack trace lines
    lines = lines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('at Module.') &&
             !trimmed.startsWith('at Object.Module.') &&
             !trimmed.startsWith('at Function.Module.') &&
             !trimmed.startsWith('at internal/') &&
             !trimmed.includes('internal/modules/cjs/loader.js') &&
             !trimmed.includes('internal/main/run_main_module.js') &&
             !trimmed.includes('node:internal/');
    });

    // Replace sandbox paths /box/script.js → "Your code"
    lines = lines.map(line =>
      line.replace(/\/box\/script\.(js|ts)/g, 'Your code')
    );
  }

  if (language === 'java') {
    // Clean up Java exception messages
    // Keep the exception type + message + relevant stack trace lines (Main.java only)
    const relevantLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('at ') && !trimmed.includes('Main.java')) {
        continue; // Skip framework/JDK stack trace lines
      }
      if (trimmed.startsWith('Exception in thread')) {
        // Extract just the exception: "ArrayIndexOutOfBoundsException: Index 6 out of bounds for length 5"
        const match = trimmed.match(/:\s*(\w+(?:\.\w+)*Exception:?.*)$/);
        if (match) {
          relevantLines.push(match[1].trim());
          continue;
        }
      }
      // Keep "at Main.xxx(Main.java:N)" but clean it up
      if (trimmed.startsWith('at Main.')) {
        const lineMatch = trimmed.match(/Main\.java:(\d+)/);
        if (lineMatch) {
          relevantLines.push(`  → at line ${lineMatch[1]}`);
          continue;
        }
      }
      relevantLines.push(line);
    }
    lines = relevantLines;
  }

  if (language === 'cpp' || language === 'c') {
    // Clean up C++ error messages
    lines = lines.filter(line => {
      const trimmed = line.trim();
      // Remove "run: line 1: ... Aborted (core dumped) ..." noise
      return !trimmed.startsWith('run: line') && !trimmed.includes('core dumped');
    });

    // Clean up compilation error paths: main.cpp:14:9 → Line 14, Col 9
    lines = lines.map(line =>
      line.replace(/main\.cpp:(\d+):(\d+):/g, 'Line $1, Col $2:')
        .replace(/main\.cpp:(\d+):/g, 'Line $1:')
    );
  }

  // Remove empty lines at start/end
  let result = lines.join('\n').trim();

  // Truncate very long error messages (max ~500 chars for readability)
  if (result.length > 500) {
    result = result.substring(0, 500) + '\n... (error truncated)';
  }

  return result;
}

/**
 * Format a Judge0 error into a user-friendly, actionable error message.
 *
 * Returns a structured error string like:
 *   🔴 Compilation Error: expected ',' or ';' before 'for'
 *      Line 14, Col 9
 *   💡 Check your syntax — look for missing brackets, semicolons, or typos.
 *
 * Or undefined if there's no error.
 */
function formatErrorMessage(
  statusId: number,
  stderr: string | null,
  compileOutput: string | null,
  language: string,
): string | undefined {
  const rawError = stderr || compileOutput;
  if (!rawError || rawError.trim() === '') return undefined;

  // Classify the error type
  const errorType = classifyError(statusId, rawError, language);
  const classification = ERROR_CLASSIFICATIONS[errorType] || ERROR_CLASSIFICATIONS.runtime_error;

  // Clean the error text
  const cleanedError = cleanErrorText(rawError, language);

  // Build the formatted message
  let formatted = `${classification.emoji} ${classification.label}`;

  if (cleanedError) {
    formatted += `\n${cleanedError}`;
  }

  // Add actionable suggestion
  formatted += `\n\n💡 ${classification.suggestion}`;

  return formatted;
}

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const MOCK_MODE = process.env.JUDGE0_MOCK_MODE === 'true';

/**
 * Judge0 Service
 * Handles all interactions with Judge0 API
 *
 * MOCK MODE: Set JUDGE0_MOCK_MODE=true to simulate execution without Docker
 * This is useful for Windows development where cgroup errors occur
 */
class Judge0Service {
  private axios;

  constructor() {
    this.axios = axios.create({
      baseURL: JUDGE0_URL,
      headers: JUDGE0_API_KEY ? { 'X-Auth-Token': JUDGE0_API_KEY } : {},
    });

    if (MOCK_MODE) {
      console.log('🔶 Judge0 Mock Mode ENABLED - Using simulated execution');
    }
  }

  /**
   * Mock execution for development/testing
   * Simulates code execution by checking if the code looks reasonable
   */
  private mockExecution(params: {
    sourceCode: string;
    language: string;
    stdin?: string;
    expectedOutput?: string;
  }): Judge0Result {
    console.log('🔶 Mock Execution:', { language: params.language, hasInput: !!params.stdin });

    // Simulate some basic "smart" checking
    const code = params.sourceCode.toLowerCase();
    let mockOutput = '';
    let statusId = 3; // Accepted
    let stderr = null;

    // Check for common patterns
    if (params.stdin) {
      // If there's input, try to generate reasonable output
      if (code.includes('twosum') || code.includes('two_sum')) {
        mockOutput = '[0,1]'; // Default twoSum answer
      } else if (code.includes('print') || code.includes('console.log')) {
        // Simulate printing something
        mockOutput = params.expectedOutput || 'output';
      } else {
        mockOutput = params.expectedOutput || 'mock output';
      }
    }

    // Check for syntax errors
    if (code.includes('syntaxerror') || code.length < 10) {
      statusId = 6; // Compilation Error
      stderr = 'SyntaxError: Invalid syntax';
      mockOutput = '';
    }

    return {
      token: `mock_${Date.now()}`,
      status: {
        id: statusId,
        description: statusId === 3 ? 'Accepted' : 'Compilation Error',
      },
      stdout: mockOutput,
      stderr,
      compile_output: null,
      time: (Math.random() * 0.5 + 0.1).toFixed(3), // Random 0.1-0.6s
      memory: Math.floor(Math.random() * 10000 + 5000), // Random 5-15MB
    };
  }

  /**
   * Submit code to Judge0 for execution
   */
  async submitCode(params: {
    sourceCode: string;
    language: string;
    stdin?: string;
    expectedOutput?: string;
  }): Promise<string> {
    try {
      const languageId = getJudge0LanguageId(params.language);

      const submission: Judge0Submission = {
        source_code: Buffer.from(params.sourceCode).toString('base64'),
        language_id: languageId,
        stdin: params.stdin ? Buffer.from(params.stdin).toString('base64') : undefined,
        expected_output: params.expectedOutput ? Buffer.from(params.expectedOutput).toString('base64') : undefined,
        cpu_time_limit: 5,  // 5 seconds
        memory_limit: 256000, // 256 MB
      };

      const response = await this.axios.post('/submissions?base64_encoded=true&wait=false', submission);
      return response.data.token;
    } catch (error: any) {
      console.error('Judge0 submission error:', error.response?.data || error.message);
      throw new Error(`Failed to submit code: ${error.message}`);
    }
  }

  /**
   * Get submission result from Judge0
   */
  async getSubmission(token: string): Promise<Judge0Result> {
    try {
      const response = await this.axios.get(`/submissions/${token}?base64_encoded=true`);
      const data = response.data;

      return {
        token: data.token,
        status: {
          id: data.status.id,
          description: data.status.description,
        },
        stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8') : null,
        stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf-8') : null,
        compile_output: data.compile_output ? Buffer.from(data.compile_output, 'base64').toString('utf-8') : null,
        time: data.time,
        memory: data.memory,
      };
    } catch (error: any) {
      console.error('Judge0 get submission error:', error.response?.data || error.message);
      throw new Error(`Failed to get submission: ${error.message}`);
    }
  }

  /**
   * Submit and wait for result (with polling)
   */
  async submitAndWait(params: {
    sourceCode: string;
    language: string;
    stdin?: string;
    expectedOutput?: string;
  }): Promise<Judge0Result> {
    // Use Mock Mode if enabled (bypasses Judge0 Docker)
    if (MOCK_MODE) {
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      return this.mockExecution(params);
    }

    const token = await this.submitCode(params);

    // Poll for result (max 30 seconds)
    const maxAttempts = 30;
    const pollInterval = 1000; // 1 second

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.getSubmission(token);

      // Status IDs: 1 = In Queue, 2 = Processing
      if (result.status.id > 2) {
        return result;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Submission timeout - took too long to execute');
  }

  /**
   * Execute code against multiple test cases
   */
  async executeTestCases(params: {
    sourceCode: string;
    language: string;
    functionName?: string;
    testRunnerTemplate?: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
  }): Promise<Array<{
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    consoleOutput?: string;
    error?: string;
    executionTime?: number;
    memory?: number;
  }>> {
    // Determine stdin mode once (same for all test cases since same template/language)
    const effectiveTemplate = params.testRunnerTemplate || (params.functionName ? DEFAULT_TEST_RUNNERS[params.language] : null);
    const isStdinBased = effectiveTemplate ? !effectiveTemplate.includes('{{TEST_INPUT}}') : false;

    console.log(`⚡ Executing ${params.testCases.length} test cases in PARALLEL (${params.language}, stdin=${isStdinBased})`);

    // Execute ALL test cases concurrently with Promise.allSettled for resilience
    const settled = await Promise.allSettled(
      params.testCases.map(async (testCase) => {
        // Wrap code with test runner per test case (input may differ)
        const finalCode = wrapCodeWithTestRunner({
          userCode: params.sourceCode,
          language: params.language,
          functionName: params.functionName,
          testInput: testCase.input,
          testRunnerTemplate: params.testRunnerTemplate,
        });

        // Fix TypeScript compilation: Judge0's TS compiler defaults to ES5 which
        // doesn't include Promise, Map, Set, etc. Prepend the ES2015 lib reference.
        const codeToSubmit = params.language === 'typescript'
          ? `/// <reference lib="es2015" />\n${finalCode}`
          : finalCode;

        const stdinInput = isStdinBased ? testCase.input : undefined;

        const result = await this.submitAndWait({
          sourceCode: codeToSubmit,
          language: params.language,
          stdin: stdinInput,
          // NOTE: Do NOT send expectedOutput to Judge0 — our RESULT_DELIMITER in
          // stdout would cause Judge0's own comparison to fail. We do our own
          // comparison below using parseStdout().
        });

        const { consoleOutput, actualResult } = parseStdout(result.stdout);
        const expectedOutput = testCase.expectedOutput.trim();
        // Status 3 = Accepted (ran OK), 4 = Wrong Answer (ran OK but Judge0 comparison failed)
        // Both mean the code executed successfully. We only care about our own comparison.
        const executedSuccessfully = result.status.id === 3 || result.status.id === 4;
        const passed = executedSuccessfully && actualResult === expectedOutput;

        // Format error message — only show for actual errors, not for successful runs
        const hasError = result.status.id >= 5 || (result.stderr && result.stderr.trim() !== '');
        let formattedError = hasError
          ? formatErrorMessage(result.status.id, result.stderr, result.compile_output, params.language)
          : undefined;

        // Handle "No output" case with detailed explanation
        let outputToShow = actualResult;
        if (executedSuccessfully && !actualResult) {
          // Code ran successfully but produced no output
          outputToShow = '';

          // If there's no error already and no output, explain what might be wrong
          if (!formattedError && !passed) {
            formattedError = `⚠️ Missing Output\n\nYour code executed successfully but didn't return or print anything.\n\n💡 Common issues:\n• Missing return statement in your function\n• Not calling console.log() or print()\n• Function doesn't return the result\n• Logic doesn't reach the return statement\n\nExpected: ${expectedOutput}\nGot: (nothing)`;
          }
        } else if (executedSuccessfully && !passed && actualResult) {
          // Code ran successfully, produced output, but it doesn't match expected
          // Add helpful error message explaining the mismatch
          if (!formattedError) {
            // Check for common issues
            const trimmedActual = actualResult.trim();
            const trimmedExpected = expectedOutput.trim();

            let mismatchReason = '';
            if (trimmedActual === trimmedExpected) {
              mismatchReason = '• Extra whitespace or newlines in your output';
            } else if (actualResult.toLowerCase() === expectedOutput.toLowerCase()) {
              mismatchReason = '• Case sensitivity issue (uppercase vs lowercase)';
            } else if (JSON.stringify(actualResult) !== JSON.stringify(expectedOutput)) {
              // Try to detect data type mismatches
              try {
                const actualParsed = JSON.parse(actualResult);
                const expectedParsed = JSON.parse(expectedOutput);
                if (Array.isArray(actualParsed) && Array.isArray(expectedParsed)) {
                  mismatchReason = '• Array elements don\'t match the expected order or values';
                } else if (typeof actualParsed !== typeof expectedParsed) {
                  mismatchReason = `• Data type mismatch: returning ${typeof actualParsed} instead of ${typeof expectedParsed}`;
                }
              } catch {
                // Not JSON - check for other common issues
                if (actualResult.includes('\n') || expectedOutput.includes('\n')) {
                  mismatchReason = '• Line break or formatting issue';
                } else if (actualResult.length !== expectedOutput.length) {
                  mismatchReason = `• Output length mismatch: got ${actualResult.length} characters, expected ${expectedOutput.length}`;
                }
              }
            }

            formattedError = `❌ Wrong Answer\n\nYour code executed successfully but the output doesn't match.\n\n${mismatchReason ? mismatchReason + '\n\n' : ''}Expected: ${expectedOutput}\nGot: ${actualResult}\n\n💡 Check your logic and make sure you're returning the exact format expected.`;
          }
        }

        return {
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          // actualOutput should only show program output, NOT error text
          actualOutput: outputToShow,
          consoleOutput: consoleOutput || undefined,
          error: formattedError,
          executionTime: result.time ? parseFloat(result.time) * 1000 : undefined,
          memory: result.memory || undefined,
        };
      })
    );

    // Map settled results back — fulfilled = success, rejected = error
    const results = settled.map((outcome, index) => {
      if (outcome.status === 'fulfilled') {
        return outcome.value;
      }
      // Rejected — return error result for this test case
      const testCase = params.testCases[index];
      return {
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        error: (outcome.reason as Error)?.message || 'Unknown execution error',
      };
    });

    console.log(`✅ All ${params.testCases.length} test cases completed: ${results.filter(r => r.passed).length} passed`);
    return results;
  }

  /**
   * Check if Judge0 is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.axios.get('/about');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const judge0Service = new Judge0Service();

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

        const stdinInput = isStdinBased ? testCase.input : undefined;

        const result = await this.submitAndWait({
          sourceCode: finalCode,
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

        return {
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: actualResult || result.stderr || 'No output',
          consoleOutput: consoleOutput || undefined,
          error: result.stderr || result.compile_output || undefined,
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

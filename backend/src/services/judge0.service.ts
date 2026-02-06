import axios from 'axios';
import { getJudge0LanguageId, mapJudge0Status, Judge0Submission, Judge0Result } from '../utils/judge0.util';

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
    testCases: Array<{ input: string; expectedOutput: string }>;
  }): Promise<Array<{
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    error?: string;
    executionTime?: number;
    memory?: number;
  }>> {
    const results = [];

    for (const testCase of params.testCases) {
      try {
        const result = await this.submitAndWait({
          sourceCode: params.sourceCode,
          language: params.language,
          stdin: testCase.input,
          expectedOutput: testCase.expectedOutput,
        });

        const actualOutput = (result.stdout || '').trim();
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = actualOutput === expectedOutput && result.status.id === 3; // 3 = Accepted

        results.push({
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: actualOutput || result.stderr || 'No output',
          error: result.stderr || result.compile_output || undefined,
          executionTime: result.time ? parseFloat(result.time) * 1000 : undefined, // Convert to ms
          memory: result.memory || undefined,
        });
      } catch (error: any) {
        results.push({
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          error: error.message,
        });
      }
    }

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

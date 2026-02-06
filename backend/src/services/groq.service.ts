import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

/**
 * Groq AI Service
 * Uses Groq's LLaMA models to generate test cases for coding problems
 */
class GroqService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: GROQ_API_KEY,
    });
  }

  /**
   * Generate test cases using Groq AI
   */
  async generateTestCases(params: {
    description: string;
    boilerplateCode: string;
    wrapperCode: string;
    functionName: string;
    language: string;
    numberOfTestCases: number;
  }): Promise<Array<{
    input: string;
    expectedOutput: string;
    explanation?: string;
  }>> {
    try {
      const prompt = this.buildPrompt(params);

      console.log('🤖 Generating test cases with Groq AI...');

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert coding problem test case generator. You generate accurate, diverse test cases for coding problems. Always respond with valid JSON only, no extra text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile', // Fast and accurate model
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      });

      const responseText = chatCompletion.choices[0]?.message?.content || '{}';
      console.log('📝 Groq AI Response:', responseText.substring(0, 200) + '...');

      const parsed = JSON.parse(responseText);
      const testCases = parsed.testCases || parsed.test_cases || [];

      return testCases.map((tc: any) => ({
        input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
        expectedOutput: typeof tc.expectedOutput === 'string'
          ? tc.expectedOutput
          : typeof tc.expected_output === 'string'
            ? tc.expected_output
            : JSON.stringify(tc.expectedOutput || tc.expected_output),
        explanation: tc.explanation || tc.description,
      }));
    } catch (error: any) {
      console.error('❌ Groq AI Error:', error.message);
      throw new Error(`Failed to generate test cases: ${error.message}`);
    }
  }

  /**
   * Build prompt for test case generation
   */
  private buildPrompt(params: {
    description: string;
    boilerplateCode: string;
    wrapperCode: string;
    functionName: string;
    language: string;
    numberOfTestCases: number;
  }): string {
    return `Generate ${params.numberOfTestCases} test cases for the following coding problem.

## Problem Description:
${params.description}

## Function Signature (${params.language}):
${params.boilerplateCode}

## Wrapper Code Template:
${params.wrapperCode}

## Function Name: ${params.functionName}

## Instructions:
1. Generate ${params.numberOfTestCases} diverse test cases covering:
   - Edge cases (empty inputs, single elements, etc.)
   - Normal cases (typical inputs)
   - Large cases (if applicable)
2. For each test case, provide:
   - **input**: The test input in the format that matches the wrapper code (e.g., "nums = [2,7,11,15], target = 9" or "[[2,7,11,15], 9]")
   - **expectedOutput**: The expected output as a string (e.g., "[0,1]")
   - **explanation**: Brief explanation of what this test case checks

## Output Format:
Return a JSON object with this exact structure:
{
  "testCases": [
    {
      "input": "input string here",
      "expectedOutput": "output string here",
      "explanation": "what this tests"
    }
  ]
}

Generate the test cases now:`;
  }

  /**
   * Validate and refine test cases
   */
  async validateTestCase(params: {
    description: string;
    input: string;
    expectedOutput: string;
    language: string;
  }): Promise<{
    isValid: boolean;
    suggestions?: string;
  }> {
    try {
      const prompt = `Validate this test case for a coding problem:

Problem: ${params.description}
Language: ${params.language}
Input: ${params.input}
Expected Output: ${params.expectedOutput}

Is this test case valid? Does the expected output make sense for the given input?
Respond with JSON: { "isValid": true/false, "suggestions": "improvement suggestions if any" }`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a test case validator. Respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const responseText = chatCompletion.choices[0]?.message?.content || '{}';
      return JSON.parse(responseText);
    } catch (error: any) {
      console.error('Validation error:', error.message);
      return { isValid: true }; // Default to valid if validation fails
    }
  }
}

export const groqService = new GroqService();

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

      // Log usage
      await this.logUsage(
        'llama-3.3-70b-versatile',
        'test_case_generation',
        chatCompletion.usage?.total_tokens || 0,
        (params as any).userId,
        (params as any).contestId,
        (params as any).taskId
      );

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

  /**
   * Generate boilerplate and wrapper code for a task
   */
  async generateTaskCode(params: {
    description: string;
    functionName: string;
    languages: string[];
    inputFormat?: string;
    outputFormat?: string;
  }): Promise<Record<string, { boilerplate: string; driver: string }>> {
    try {
      const prompt = `
        You are an expert coding interview platform architect.
        Generate "boilerplate" code (method signature) and "driver" code (input/output handling) for the following problem.
        
        Problem Description:
        ${params.description}
        
        Function Name: ${params.functionName}
        ${params.inputFormat ? `Input Format: ${params.inputFormat}` : ''}
        ${params.outputFormat ? `Output Format: ${params.outputFormat}` : ''}
        
        Target Languages: ${params.languages.join(', ')}
        
        For EACH language, you MUST generate:
        1. "boilerplate": The starter code for the user. It should contain the class (if applicable for the language) and function definition.
        2. "driver": The hidden driver code that:
           - Imports necessary libraries.
           - Reads input from STDIN (standard input).
           - Parses the input lines.
           - Calls the user's function (assuming it's available/imported).
           - Prints the result to STDOUT (standard output).
           
        IMPORTANT: Use Judge0 compatible code.
        - Javascript/Typescript: Use 'fs.readFileSync(0, "utf-8")' or 'readline'.
        - Python: Use 'sys.stdin.read()'.
        - Java: Use 'Scanner' or 'BufferedReader'.
        - C++: Use 'cin' and 'cout'.
        
        Response Format:
        Return ONLY a JSON object where keys are language names (lowercase) and values are objects containing "boilerplate" and "driver" strings.
        Example:
        {
          "javascript": {
            "boilerplate": "function solve(a, b) {\\n  return a + b;\\n}",
            "driver": "const fs = require('fs');\\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');..."
          }
        }
      `;

      console.log('🤖 Generating task code with Groq AI...');

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert code generator. Always respond with valid JSON only. No markdown formatting, no explanation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2, // Lower temperature for more deterministic code
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      });

      const responseContent = chatCompletion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('Received empty response from Groq');
      }

      // Log usage
      await this.logUsage(
        'llama-3.3-70b-versatile',
        'code_generation',
        chatCompletion.usage?.total_tokens || 0,
        (params as any).userId,  // Need to pass userId in params
        (params as any).contestId,
        (params as any).taskId
      );

      return JSON.parse(responseContent);
    } catch (error) {
      console.error('Error generating task code:', error);
      throw error;
    }
  }
  /**
   * Log AI usage to database
   */
  private async logUsage(
    model: string,
    purpose: string,
    tokens: number,
    userId?: number,
    contestId?: number,
    taskId?: number
  ) {
    if (!userId) return; // Don't log if no user associated (though usually there is)

    try {
      const { db } = await import('../config/database');
      const { aiUsageLogs } = await import('../db/schema');

      await db.insert(aiUsageLogs).values({
        provider: 'groq',
        model,
        purpose,
        tokensUsed: tokens,
        userId,
        contestId,
        taskId,
        timestamp: new Date(),
      });
      console.log('✅ AI Usage logged successfully');
    } catch (error) {
      console.error('❌ Failed to log AI usage:', error);
    }
  }
}

export const groqService = new GroqService();

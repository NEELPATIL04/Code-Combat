import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

/**
 * Groq AI Service
 * Uses Groq's LLaMA models to generate test cases for coding problems
 */
class GroqService {
  private groq: Groq;

  constructor() {
    if (!GROQ_API_KEY) {
      console.warn('⚠️ GROQ_API_KEY not set! AI features will not work properly. Set GROQ_API_KEY in .env file.');
    }
    
    this.groq = new Groq({
      apiKey: GROQ_API_KEY || 'placeholder',
    });
  }

  /**
   * Check if Groq AI is properly configured
   */
  private validateApiKey(): void {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured. Please set GROQ_API_KEY in your .env file.');
    }
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
      this.validateApiKey();
      
      const prompt = this.buildPrompt(params);

      console.log('🤖 Generating test cases with Groq AI...');
      console.log('   Function: ' + params.functionName);
      console.log('   Language: ' + params.language);
      console.log('   Count: ' + params.numberOfTestCases);

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
      console.log('📝 Groq AI Response received:', responseText.substring(0, 100) + '...');

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

## Wrapper/Driver Code Template:
${params.wrapperCode}

## Function Name: ${params.functionName}

## CRITICAL RULES:

### Input Format:
The "input" field is what gets passed to the program via STDIN (standard input). Look at the wrapper/driver code above to understand how it reads and parses input.
- If the driver does \`fs.readFileSync(0, 'utf-8').trim()\` or \`sys.stdin.read().strip()\` or \`scanner.nextLine()\` or \`getline(cin, s)\`, then "input" should be the RAW string value that gets read.
- For a single string argument: just provide the raw string (e.g., \"hello\" or \"madam\" or \"\" for empty).
- For multiple arguments on separate lines: put each on a new line (e.g., \"2 7 11 15\\n9\").
- For arrays: use the format the driver expects (e.g., \"[2,7,11,15]\" if the driver does JSON.parse).
- Do NOT use named parameter format like \"nums = [2,7,11,15], target = 9\" unless the driver explicitly parses that format.

### Expected Output Format:
The "expectedOutput" field must match EXACTLY what the program prints to STDOUT.
- Booleans MUST be lowercase: \"true\" or \"false\" (never \"True\"/\"False\", never \"1\"/\"0\").
- Arrays MUST be JSON format: \"[0,1]\" or \"[1, 2, 3]\".
- Strings should NOT have extra quotes unless the driver explicitly adds them.
- Numbers should be plain: \"42\" not \"42.0\" (unless the problem returns floats).

### Test Case Diversity:
1. Generate ${params.numberOfTestCases} diverse test cases covering:
   - Edge cases (empty input, single element, boundary values)
   - Normal/typical cases
   - Tricky cases (duplicates, negative numbers, special characters if applicable)
2. For each test case, provide:
   - **input**: Raw STDIN input string
   - **expectedOutput**: Exact STDOUT output string
   - **explanation**: Brief explanation of what this test case checks

## Output Format:
Return a JSON object with this exact structure:
{
  "testCases": [
    {
      "input": "raw stdin input here",
      "expectedOutput": "exact stdout output here",
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
      const prompt = `You are an expert coding interview platform architect building code for a Judge0 CE sandbox.

Problem Description:
${params.description}

Function Name: ${params.functionName}
${params.inputFormat ? `Input Format: ${params.inputFormat}` : ''}
${params.outputFormat ? `Output Format: ${params.outputFormat}` : ''}

Target Languages: ${params.languages.join(', ')}

For EACH language, generate TWO things:

1. "boilerplate": The starter code the user sees in their editor. It should ONLY contain the function/method signature with a placeholder body. For Java, wrap in a class. For C++, wrap in a Solution class.

2. "driver": The hidden test-runner code. This is a COMPLETE, SELF-CONTAINED script that will be saved and executed as a SINGLE FILE in Judge0. 

CRITICAL RULES FOR THE DRIVER CODE:
- The driver MUST contain the literal placeholder {{USER_CODE}} at the TOP of the file (or inside the class for Java/C++). At runtime, the platform will replace {{USER_CODE}} with the user's actual code before sending to Judge0.
- The driver reads ONE test case input from STDIN, calls the user's function, and prints the result to STDOUT.
- ALL languages MUST output boolean values as lowercase "true" or "false" (never "True"/"False", never "1"/"0").
- ALL languages MUST output arrays/lists as JSON arrays like [1,2,3].
- ALL languages MUST output strings WITHOUT extra quotes unless the expected output includes them.

LANGUAGE-SPECIFIC RULES:

JavaScript:
- Use: const fs = require('fs'); const input = fs.readFileSync(0, 'utf-8').trim();
- Place {{USER_CODE}} at the top, then the driver code below it.
- For booleans: console.log(result) works (JS prints lowercase true/false).

TypeScript:
- MUST start with: declare const process: any; declare function require(name: string): any;
- Then: const fs = require('fs'); const input = fs.readFileSync(0, 'utf-8').trim();
- Place {{USER_CODE}} at the top (after declares), then driver code.

Python:
- Use: import sys; input_data = sys.stdin.read().strip()
- Place {{USER_CODE}} at the top, then driver code.
- For booleans: print(str(result).lower()) to get "true"/"false" instead of "True"/"False".
- For lists: import json; print(json.dumps(result))

Java:
- The driver must be a SINGLE public class Main with a main method.
- Place {{USER_CODE}} as a static method INSIDE the Main class (the user writes just the method body).
- Use Scanner with hasNextLine() guard: String s = scanner.hasNextLine() ? scanner.nextLine() : "";
- For booleans: System.out.println(result) works (Java prints lowercase).
- The boilerplate should be JUST the static method signature (e.g., public static boolean ${params.functionName}(String s) { ... }).

C++:
- The driver includes necessary headers and uses namespace std.
- Define a Solution class with {{USER_CODE}} as the method inside it.
- Use: cout << boolalpha << result; for booleans.
- Use getline(cin, s) for string input.
- The boilerplate should be JUST the method signature inside a Solution class.

RESPONSE FORMAT:
Return ONLY a JSON object. Keys are lowercase language names. Values have "boilerplate" and "driver" strings.
Example for a function that checks if a string is a palindrome:
{
  "javascript": {
    "boilerplate": "function ${params.functionName}(s) {\\n  // Your code here\\n  return false;\\n}",
    "driver": "{{USER_CODE}}\\nconst fs = require('fs');\\nconst input = fs.readFileSync(0, 'utf-8').trim();\\nconst result = ${params.functionName}(input);\\nconsole.log(result);"
  }
}

REMEMBER: Every driver MUST include {{USER_CODE}} as a literal placeholder string. Without it, the user's code will never be included and the function will be undefined at runtime.`;

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

      const parsed = JSON.parse(responseContent);

      // POST-PROCESSING: Validate and fix driver templates
      for (const [lang, code] of Object.entries(parsed) as [string, any][]) {
        if (code.driver && !code.driver.includes('{{USER_CODE}}')) {
          console.warn(`⚠️ AI-generated driver for ${lang} is MISSING {{USER_CODE}} placeholder. Auto-fixing...`);
          
          // For Java/C++ with classes, try to insert before the class
          if (lang === 'java') {
            // Insert {{USER_CODE}} as a comment marker inside the class
            // The wrapper util's mergeJavaCode will handle the actual merging
            code.driver = code.driver.replace(
              /public\s+class\s+Main\s*\{/,
              'public class Main {\n  {{USER_CODE}}\n'
            );
          } else if (lang === 'cpp') {
            // Insert before main()
            code.driver = code.driver.replace(
              /int\s+main\s*\(\s*\)/,
              '{{USER_CODE}}\n\nint main()'
            );
          } else {
            // For JS/TS/Python: prepend {{USER_CODE}} at the top
            code.driver = '{{USER_CODE}}\n\n' + code.driver;
          }
          
          console.log(`✅ Auto-fixed ${lang} driver template with {{USER_CODE}} placeholder`);
        }
      }

      return parsed;
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

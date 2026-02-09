import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_HINT_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export class AIService {
    private groq: Groq;
    private gemini: GoogleGenerativeAI;

    constructor() {
        if (!GROQ_API_KEY) {
            console.warn('⚠️  GROQ_HINT_API_KEY not configured. AI hints will use Gemini fallback.');
        }
        if (!GEMINI_API_KEY) {
            console.warn('⚠️  GEMINI_API_KEY not configured. AI features may not work properly.');
        }
        this.groq = new Groq({ apiKey: GROQ_API_KEY });
        this.gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
    }

    /**
     * Generate a helpful hint for the user based on their code and error
     */
    async generateHint(
        problemDescription: string,
        userCode: string,
        language: string,
        errorLogs?: string,
        userId?: number,
        taskId?: number,
        contestId?: number
    ): Promise<string> {
        const prompt = `
      You are a helpful coding tutor. A student is trying to solve a programming problem but is stuck.
      
      Problem Description:
      ${problemDescription}
      
      Student's Code (${language}):
      ${userCode}
      
      ${errorLogs ? `Error Logs:\n${errorLogs}` : ''}
      
      Please provide a helpful hint to guide them towards the solution. 
      Do NOT provide the full solution code. 
      Focus on logic, edge cases, or syntax errors they might have missed. 
      Keep the hint concise and encouraging.
    `;

        const meta = { userId, taskId, contestId, purpose: 'hint' };
        try {
            console.log(`🤖 Generating hint for user ${userId}, task ${taskId}`);
            return await this.callGroq(prompt, false, meta);
        } catch (error: any) {
            console.warn('⚠️  Groq hint generation failed, falling back to Gemini:', error.message);
            try {
                return await this.callGemini(prompt, false, meta);
            } catch (fallbackError: any) {
                console.error('❌ Both Groq and Gemini hint generation failed:', fallbackError.message);
                throw new Error('AI hint generation failed. Please try again later.');
            }
        }
    }

    /**
     * Generate the full solution (only used after threshold reached)
     */
    async generateSolution(
        problemDescription: string,
        language: string,
        boilerplateCode?: string,
        userId?: number,
        taskId?: number,
        contestId?: number
    ): Promise<string> {
        const boilerplateSection = boilerplateCode
            ? `\nBoilerplate/Function Signature (${language}):\n${boilerplateCode}\n\nIMPORTANT: Your solution MUST follow the exact function signature shown in the boilerplate above. Replace only the function body with working logic. Do NOT change the function name, parameters, or return type.\n`
            : '';

        const prompt = `
You are an expert programmer. Provide a complete, working solution for the following coding problem.

Problem Description:
${problemDescription}

Programming Language: ${language}
${boilerplateSection}
Requirements:
1. Write complete, executable code in ${language}
2. ${boilerplateCode ? 'MUST use the exact function signature from the boilerplate above' : 'Include all necessary imports/includes'}
3. Implement the full solution, not just boilerplate
4. Handle edge cases appropriately
5. Use efficient algorithms
6. Add brief inline comments for complex logic

Output Format:
- Provide ONLY the code, no markdown formatting
- No explanations before or after the code
- No \`\`\` code blocks
- Just the raw, executable code
${boilerplateCode ? '- Return ONLY the function body code that fits inside the boilerplate signature' : ''}
    `;

        const meta = { userId, taskId, contestId, purpose: 'solution' };
        try {
            console.log(`🤖 Generating solution for user ${userId}, task ${taskId}, language: ${language}`);
            console.log(`📝 Problem description length: ${problemDescription?.length || 0} characters`);
            console.log(`📝 Problem description preview: ${problemDescription?.substring(0, 200) || 'EMPTY'}...`);

            const rawSolution = await this.callGroq(prompt, false, meta);

            // Clean up the response - remove markdown code blocks if present
            let cleanedSolution = rawSolution.trim();

            // Remove markdown code blocks (```language ... ```)
            const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
            const match = codeBlockRegex.exec(cleanedSolution);
            if (match) {
                cleanedSolution = match[1].trim();
            }

            console.log(`✅ Generated solution length: ${cleanedSolution.length} characters`);
            return cleanedSolution;
        } catch (error: any) {
            console.warn('⚠️  Groq solution generation failed, falling back to Gemini:', error.message);
            try {
                const rawSolution = await this.callGemini(prompt, false, meta);

                // Clean up the response - remove markdown code blocks if present
                let cleanedSolution = rawSolution.trim();

                // Remove markdown code blocks (```language ... ```)
                const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
                const match = codeBlockRegex.exec(cleanedSolution);
                if (match) {
                    cleanedSolution = match[1].trim();
                }

                console.log(`✅ Generated solution (Gemini) length: ${cleanedSolution.length} characters`);
                return cleanedSolution;
            } catch (fallbackError: any) {
                console.error('❌ Both Groq and Gemini solution generation failed:', fallbackError.message);
                throw new Error('AI solution generation failed. Please try again later.');
            }
        }
    }

    /**
     * Evaluate the user's submission and provide detailed feedback
     */
    async evaluateSubmission(
        problemDescription: string,
        userCode: string,
        language: string,
        testResults: string,
        userId?: number,
        taskId?: number,
        contestId?: number
    ): Promise<{
        score: number;
        feedback: string;
        suggestions: string[];
    }> {
        const prompt = `
      You are a code evaluator. Assess the following submission for a coding problem.
      
      Problem:
      ${problemDescription}
      
      User Code (${language}):
      ${userCode}
      
      Test Results:
      ${testResults}
      
      Provide a JSON response with the following structure:
      {
        "score": number (0-100),
        "feedback": "string (summary of performance/correctness)",
        "suggestions": ["string", "string"] (list of specific improvements)
      }
    `;

        const meta = { userId, taskId, contestId, purpose: 'evaluation' };
        try {
            const responseCtx = await this.callGroq(prompt, true, meta);
            return JSON.parse(responseCtx);
        } catch (error) {
            console.warn('Groq evaluation failed, falling back to Gemini:', error);
            const responseCtx = await this.callGemini(prompt, true, meta);
            // Gemini might wrap JSON in markdown code blocks
            const cleaned = responseCtx.replace(/```json/g, '').replace(/```/g, '');
            return JSON.parse(cleaned);
        }
    }

    private async callGroq(prompt: string, jsonMode = false, meta?: { userId?: number; contestId?: number; taskId?: number; purpose: string }): Promise<string> {
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_HINT_API_KEY is not configured');
        }

        try {
            const model = 'llama-3.3-70b-versatile';
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model,
                temperature: 0.7,
                max_tokens: 1024,
                response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
            });

            const content = chatCompletion.choices[0]?.message?.content || '';

            if (!content) {
                throw new Error('Groq returned empty response');
            }

            // Log usage asynchronously
            if (meta) {
                import('../config/database').then(({ db }) => {
                    import('../db/schema').then(({ aiUsageLogs }) => {
                        db.insert(aiUsageLogs).values({
                            provider: 'groq',
                            model,
                            purpose: meta.purpose,
                            tokensUsed: chatCompletion.usage?.total_tokens || 0,
                            userId: meta.userId,
                            contestId: meta.contestId,
                            taskId: meta.taskId,
                        }).catch(err => console.error('Failed to log AI usage:', err));
                    });
                });
            }

            return content;
        } catch (error: any) {
            console.error('❌ Groq API error:', error.message);
            throw new Error(`Groq API failed: ${error.message}`);
        }
    }

    private async callGemini(prompt: string, _jsonMode = false, meta?: { userId?: number; contestId?: number; taskId?: number; purpose: string }): Promise<string> {
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        try {
            const modelName = 'gemini-pro';
            const model = this.gemini.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (!text) {
                throw new Error('Gemini returned empty response');
            }

            // Log usage asynchronously
            if (meta) {
                import('../config/database').then(({ db }) => {
                    import('../db/schema').then(({ aiUsageLogs }) => {
                        // Estimate tokens (approx 4 chars per token)
                        const estimatedTokens = Math.ceil((prompt.length + text.length) / 4);
                        db.insert(aiUsageLogs).values({
                            provider: 'gemini',
                            model: modelName,
                            purpose: meta.purpose,
                            tokensUsed: estimatedTokens,
                            userId: meta.userId,
                            contestId: meta.contestId,
                            taskId: meta.taskId,
                        }).catch(err => console.error('Failed to log AI usage:', err));
                    });
                });
            }

            return text;
        } catch (error: any) {
            console.error('❌ Gemini API error:', error.message);
            throw new Error(`Gemini API failed: ${error.message}`);
        }
    }
}

export const aiService = new AIService();

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
            return await this.callGroq(prompt, false, meta);
        } catch (error) {
            console.warn('Groq hint generation failed, falling back to Gemini:', error);
            return await this.callGemini(prompt, false, meta);
        }
    }

    /**
     * Generate the full solution (only used after threshold reached)
     */
    async generateSolution(
        problemDescription: string,
        language: string,
        userId?: number,
        taskId?: number,
        contestId?: number
    ): Promise<string> {
        const prompt = `
      You are an expert programmer. Please provide a correct and efficient solution for the following problem.
      
      Problem Description:
      ${problemDescription}
      
      Language: ${language}
      
      Provide ONLY the code solution. No markdown, no explanations. Just the raw code that can be executed.
    `;

        const meta = { userId, taskId, contestId, purpose: 'solution' };
        try {
            return await this.callGroq(prompt, false, meta);
        } catch (error) {
            console.warn('Groq solution generation failed, falling back to Gemini:', error);
            return await this.callGemini(prompt, false, meta);
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
        const model = 'llama-3.3-70b-versatile';
        const chatCompletion = await this.groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model,
            temperature: 0.7,
            max_tokens: 1024,
            response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
        });

        const content = chatCompletion.choices[0]?.message?.content || '';

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
    }

    private async callGemini(prompt: string, _jsonMode = false, meta?: { userId?: number; contestId?: number; taskId?: number; purpose: string }): Promise<string> {
        const modelName = 'gemini-pro';
        const model = this.gemini.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

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
    }
}

export const aiService = new AIService();

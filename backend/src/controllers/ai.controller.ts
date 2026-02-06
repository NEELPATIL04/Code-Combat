import { Request, Response, NextFunction } from 'express';
import { groqService } from '../services/groq.service';

/**
 * Generate test cases using AI
 * POST /api/ai/generate-test-cases
 */
export const generateTestCases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      description,
      boilerplateCode,
      wrapperCode,
      functionName,
      language,
      numberOfTestCases = 5,
    } = req.body;

    if (!description || !functionName || !language) {
      return res.status(400).json({
        success: false,
        message: 'Description, function name, and language are required',
      });
    }

    const testCases = await groqService.generateTestCases({
      description,
      boilerplateCode: boilerplateCode || '',
      wrapperCode: wrapperCode || '',
      functionName,
      language,
      numberOfTestCases: Math.min(numberOfTestCases, 10), // Max 10 test cases
    });

    res.json({
      success: true,
      testCases,
    });
  } catch (error: any) {
    console.error('Generate test cases error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate test cases',
    });
  }
};

/**
 * Validate a test case using AI
 * POST /api/ai/validate-test-case
 */
export const validateTestCase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, input, expectedOutput, language } = req.body;

    if (!description || !input || !expectedOutput || !language) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const result = await groqService.validateTestCase({
      description,
      input,
      expectedOutput,
      language,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Validate test case error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate test case',
    });
  }
};

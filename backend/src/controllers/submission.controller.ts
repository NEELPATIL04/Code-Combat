import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { submissions, testCases, tasks, contestParticipants } from '../db/schema';
import { judge0Service } from '../services/judge0.service';
import { getJudge0LanguageId } from '../utils/judge0.util';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Run code against test cases (without saving as submission)
 * POST /api/submissions/run
 */
export const runCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, code, language } = req.body;
    const userId = (req as any).user?.userId;

    if (!taskId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Task ID, code, and language are required',
      });
    }

    // Get test cases for the task
    const taskTestCases = await db
      .select()
      .from(testCases)
      .where(eq(testCases.taskId, taskId))
      .orderBy(testCases.orderIndex);

    if (taskTestCases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No test cases found for this task',
      });
    }

    // Execute code against test cases
    const results = await judge0Service.executeTestCases({
      sourceCode: code,
      language,
      testCases: taskTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    res.json({
      success: true,
      data: {
        passed: passedCount,
        total: totalCount,
        results: results.map((result, index) => ({
          testCase: index + 1,
          passed: result.passed,
          input: result.input,
          expectedOutput: result.expectedOutput,
          actualOutput: result.actualOutput,
          error: result.error,
          executionTime: result.executionTime,
          memory: result.memory,
        })),
      },
    });
  } catch (error: any) {
    console.error('Run code error:', error);
    next(error);
  }
};

/**
 * Submit code solution (saves to database)
 * POST /api/submissions/submit
 */
export const submitCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, contestId, code, language } = req.body;
    const userId = (req as any).user?.userId;

    if (!taskId || !contestId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Task ID, contest ID, code, and language are required',
      });
    }

    // Verify participant is enrolled in contest
    const participant = await db
      .select()
      .from(contestParticipants)
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.userId, userId)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this contest',
      });
    }

    // Get test cases
    const taskTestCases = await db
      .select()
      .from(testCases)
      .where(eq(testCases.taskId, taskId))
      .orderBy(testCases.orderIndex);

    if (taskTestCases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No test cases found for this task',
      });
    }

    // Execute code against test cases
    const results = await judge0Service.executeTestCases({
      sourceCode: code,
      language,
      testCases: taskTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount;

    // Get task details for scoring
    const task = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    const maxPoints = task[0]?.maxPoints || 100;
    const score = allPassed ? maxPoints : Math.floor((passedCount / totalCount) * maxPoints);

    // Determine status
    let status = 'wrong_answer';
    if (allPassed) {
      status = 'accepted';
    } else if (results.some(r => r.error?.includes('Compilation Error'))) {
      status = 'compilation_error';
    } else if (results.some(r => r.error && !r.error.includes('Wrong Answer'))) {
      status = 'runtime_error';
    }

    // Save submission
    const [submission] = await db
      .insert(submissions)
      .values({
        userId,
        taskId,
        contestId,
        language,
        languageId: getJudge0LanguageId(language),
        sourceCode: code,
        status: status as any,
        testResults: results,
        passedTests: passedCount,
        totalTests: totalCount,
        score,
        executionTime: Math.max(...results.map(r => r.executionTime || 0)),
        memoryUsed: Math.max(...results.map(r => r.memory || 0)),
        processedAt: new Date(),
      })
      .returning();

    // Update participant score if this is their best submission
    const currentScore = participant[0].score || 0;
    if (score > currentScore) {
      await db
        .update(contestParticipants)
        .set({ score })
        .where(
          and(
            eq(contestParticipants.contestId, contestId),
            eq(contestParticipants.userId, userId)
          )
        );
    }

    res.json({
      success: true,
      message: allPassed ? 'All test cases passed!' : 'Some test cases failed',
      data: {
        submissionId: submission.id,
        status,
        passed: passedCount,
        total: totalCount,
        score,
        results: results.map((result, index) => ({
          testCase: index + 1,
          passed: result.passed,
          input: result.input,
          expectedOutput: result.expectedOutput,
          actualOutput: result.actualOutput,
          error: result.error,
          executionTime: result.executionTime,
          memory: result.memory,
        })),
      },
    });
  } catch (error: any) {
    console.error('Submit code error:', error);
    next(error);
  }
};

/**
 * Get submission history for a task
 * GET /api/submissions/task/:taskId
 */
export const getTaskSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const userId = (req as any).user?.userId;

    const userSubmissions = await db
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.taskId, parseInt(taskId)),
          eq(submissions.userId, userId)
        )
      )
      .orderBy(desc(submissions.submittedAt))
      .limit(10);

    res.json({
      success: true,
      data: {
        submissions: userSubmissions,
      },
    });
  } catch (error: any) {
    console.error('Get submissions error:', error);
    next(error);
  }
};

/**
 * Health check - verify Judge0 is running
 * GET /api/submissions/health
 */
export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isHealthy = await judge0Service.healthCheck();

    res.json({
      success: true,
      judge0: isHealthy ? 'online' : 'offline',
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    next(error);
  }
};

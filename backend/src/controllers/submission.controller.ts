import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { submissions, testCases, tasks, contestParticipants, userTaskProgress, activityLogs } from '../db/schema';
import { judge0Service } from '../services/judge0.service';
import { getJudge0LanguageId } from '../utils/judge0.util';
import { eq, and, desc } from 'drizzle-orm';
import { Server } from 'socket.io';

/**
 * Run code against test cases (without saving as submission)
 * POST /api/submissions/run
 */
export const runCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, code, language } = req.body;
    // const userId = (req as any).user?.userId; // Unused in runCode

    if (!taskId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Task ID, code, and language are required',
      });
    }

    // Get task details
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
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

    // Get test runner template for this language
    const testRunnerTemplate = task.testRunnerTemplate?.[language];

    // Execute code against test cases
    const results = await judge0Service.executeTestCases({
      sourceCode: code,
      language,
      functionName: task.functionName || undefined,
      testRunnerTemplate,
      testCases: taskTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    return res.json({
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
    return next(error);
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

    // Get task details
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
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

    // Get test runner template for this language
    const testRunnerTemplate = task.testRunnerTemplate?.[language];

    // Execute code against test cases
    const results = await judge0Service.executeTestCases({
      sourceCode: code,
      language,
      functionName: task.functionName || undefined,
      testRunnerTemplate,
      testCases: taskTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount;

    // Calculate score based on task's max points
    const maxPoints = task.maxPoints || 100;
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

    // Get user progress for AI usage stats
    const [progress] = await db
      .select()
      .from(userTaskProgress)
      .where(and(eq(userTaskProgress.userId, userId), eq(userTaskProgress.taskId, taskId))) // fixed variable name userTaskProgress
      .limit(1);

    const hintsUsed = progress?.hintsUnlocked || 0;
    const usedSolution = progress?.solutionUnlocked || false;

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
        hintsUsed,
        usedSolution,
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

    // Log activity
    const [activity] = await db.insert(activityLogs).values({
      contestId,
      userId,
      activityType: 'task_submitted',
      activityData: {
        taskId,
        submissionId: submission.id,
        status,
        passed: passedCount,
        total: totalCount,
        score
      },
      severity: allPassed ? 'normal' : 'warning'
    }).returning();

    // Emit real-time update to admins
    const io = req.app.get('io') as Server;
    if (io) {
      io.to(`admin-contest-${contestId}`).emit('new-activity', {
        activity: {
          ...activity,
          // We need to fetch user details to send complete info, or frontend can re-fetch
          // For now, let's trigger a re-fetch on frontend
        }
      });
    }

    return res.json({
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
    return next(error);
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
          eq(submissions.taskId, parseInt(taskId as string)),
          eq(submissions.userId, userId)
        )
      )
      .orderBy(desc(submissions.submittedAt))
      .limit(10);

    return res.json({
      success: true,
      data: {
        submissions: userSubmissions,
      },
    });
  } catch (error: any) {
    console.error('Get submissions error:', error);
    return next(error);
  }
};

/**
 * Reset user submissions for a specific task
 * DELETE /api/submissions/task/:taskId/user/:userId/reset
 * Admin only - resets all submissions and progress for a user on a task
 */
export const resetUserTaskSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const userId = parseInt(req.params.userId);

    if (!taskId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID and User ID are required',
      });
    }

    // Verify task exists
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Delete all submissions for this user and task
    await db
      .delete(submissions)
      .where(and(
        eq(submissions.taskId, taskId),
        eq(submissions.userId, userId)
      ));

    // Reset user task progress
    await db
      .delete(userTaskProgress)
      .where(and(
        eq(userTaskProgress.taskId, taskId),
        eq(userTaskProgress.userId, userId)
      ));

    return res.status(200).json({
      success: true,
      message: 'User submissions reset successfully',
    });
  } catch (error: any) {
    console.error('Reset submissions error:', error);
    return next(error);
  }
};

/**
 * Health check - verify Judge0 is running
 * GET /api/submissions/health
 */
export const healthCheck = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const isHealthy = await judge0Service.healthCheck();

    return res.json({
      success: true,
      judge0: isHealthy ? 'online' : 'offline',
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return next(error);
  }
};

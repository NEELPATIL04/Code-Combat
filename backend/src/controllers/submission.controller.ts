import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { submissions, testCases, tasks, contestParticipants, userTaskProgress, activityLogs, contestSettings } from '../db/schema';
import { judge0Service } from '../services/judge0.service';
import { aiService } from '../services/ai.service';
import { getJudge0LanguageId } from '../utils/judge0.util';
import { eq, and, desc } from 'drizzle-orm';
import { Server } from 'socket.io';

/**
 * Run code against test cases (without saving as submission)
 * POST /api/submissions/run
 */
export const runCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, code, language, customTestCases } = req.body;
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

    // If custom test cases are provided, use them; otherwise fetch from DB
    let casesToRun: { input: string; expectedOutput: string }[] = [];

    if (Array.isArray(customTestCases) && customTestCases.length > 0) {
      // Validate custom test cases
      for (const tc of customTestCases) {
        if (typeof tc.input !== 'string' || typeof tc.expectedOutput !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Each custom test case must have input and expectedOutput strings',
          });
        }
      }
      casesToRun = customTestCases.map((tc: any) => ({ input: tc.input, expectedOutput: tc.expectedOutput }));
      console.log(`📋 Running ${casesToRun.length} CUSTOM test cases for task ${taskId}`);
    } else {
      // Get ONLY VISIBLE test cases for Run (not hidden ones)
      const taskTestCases = await db
        .select()
        .from(testCases)
        .where(and(eq(testCases.taskId, taskId), eq(testCases.isHidden, false)))
        .orderBy(testCases.orderIndex);

      if (taskTestCases.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No test cases found for this task',
        });
      }
      casesToRun = taskTestCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }));
    }

    // Get test runner template for this language
    const testRunnerTemplate = task.testRunnerTemplate?.[language];

    // Log for debugging
    console.log('📋 Task Details (Run):', {
      taskId: task.id,
      functionName: task.functionName,
      language,
      hasTestRunnerTemplate: !!testRunnerTemplate,
      availableLanguages: task.testRunnerTemplate ? Object.keys(task.testRunnerTemplate) : [],
      testCaseCount: casesToRun.length,
      isCustom: Array.isArray(customTestCases) && customTestCases.length > 0,
    });

    // Execute code against test cases
    const results = await judge0Service.executeTestCases({
      sourceCode: code,
      language,
      functionName: task.functionName || undefined,
      testRunnerTemplate,
      testCases: casesToRun,
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
          consoleOutput: result.consoleOutput || '',
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

    // Get contest settings to check submission limits
    const [settings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, contestId))
      .limit(1);

    // Check submission limit
    if (settings?.maxSubmissionsAllowed && settings.maxSubmissionsAllowed > 0) {
      const existingSubmissions = await db
        .select()
        .from(submissions)
        .where(
          and(
            eq(submissions.userId, userId),
            eq(submissions.taskId, taskId),
            eq(submissions.contestId, contestId)
          )
        );

      if (existingSubmissions.length >= settings.maxSubmissionsAllowed) {
        return res.status(403).json({
          success: false,
          message: `You have reached the maximum submission limit (${settings.maxSubmissionsAllowed}) for this task.`,
        });
      }
    }

    // Get ALL test cases (visible + hidden) for Submit
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

    const visibleCount = taskTestCases.filter(tc => !tc.isHidden).length;
    const hiddenCount = taskTestCases.filter(tc => tc.isHidden).length;

    // Log for debugging
    console.log('📋 Task Details (Submit - all test cases):', {
      taskId: task.id,
      userId,
      functionName: task.functionName,
      language,
      hasTestRunnerTemplate: !!testRunnerTemplate,
      availableLanguages: task.testRunnerTemplate ? Object.keys(task.testRunnerTemplate) : [],
      totalTestCases: taskTestCases.length,
      visibleTestCases: visibleCount,
      hiddenTestCases: hiddenCount,
    });

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
    const testCaseScore = allPassed ? maxPoints : Math.floor((passedCount / totalCount) * maxPoints);

    // --- AI Evaluation ---
    let aiEvalResult: { score: number; passed: boolean; feedback: string } | null = null;
    let finalScore = testCaseScore;

    const aiEvalConfig = task.aiEvalConfig as { enabled: boolean; weight: number; expectedConcepts: string } | null;

    if (aiEvalConfig?.enabled && aiEvalConfig.expectedConcepts?.trim()) {
      try {
        console.log(`🤖 AI Eval enabled for task ${taskId}, weight=${aiEvalConfig.weight}%`);
        aiEvalResult = await aiService.evaluateCodeConcepts(
          code,
          language,
          aiEvalConfig.expectedConcepts,
          task.description || '',
          userId,
          taskId,
          contestId
        );

        // Weighted score: testCaseScore gets (100 - weight)%, aiEvalScore gets weight%
        const aiWeight = Math.max(0, Math.min(50, aiEvalConfig.weight)); // cap at 50%
        const testWeight = 100 - aiWeight;
        const aiScoreContribution = (aiEvalResult.score / 100) * maxPoints; // scale AI score to maxPoints
        finalScore = Math.round((testCaseScore * testWeight + aiScoreContribution * aiWeight) / 100);

        console.log(`📊 AI Eval: testCaseScore=${testCaseScore}, aiScore=${aiEvalResult.score}, weight=${aiWeight}%, finalScore=${finalScore}`);
      } catch (aiError: any) {
        console.error('❌ AI Eval failed, using test case score only:', aiError.message);
        // Don't block submission if AI eval fails
        aiEvalResult = {
          score: 0,
          passed: false,
          feedback: 'AI evaluation encountered an error. Score based on test cases only.',
        };
      }
    }

    const score = finalScore;

    // Determine status
    let status = 'wrong_answer';
    if (allPassed) {
      status = 'accepted';
    } else if (results.some(r => r.error?.includes('Compilation Error'))) {
      status = 'compilation_error';
    } else if (results.some(r => r.error?.includes('Time Limit Exceeded'))) {
      status = 'time_limit_exceeded';
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
        ...(aiEvalResult ? {
          aiEvalScore: aiEvalResult.score,
          aiEvalPassed: aiEvalResult.passed,
          aiEvalFeedback: aiEvalResult.feedback,
          aiEvalExpected: aiEvalConfig?.expectedConcepts || null,
        } : {}),
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

    // Separate visible and hidden results
    const visibleResults = results.filter((_, i) => !taskTestCases[i].isHidden);
    const hiddenResults = results.filter((_, i) => taskTestCases[i].isHidden);
    const hiddenPassed = hiddenResults.filter(r => r.passed).length;

    return res.json({
      success: true,
      message: allPassed ? 'All test cases passed!' : 'Some test cases failed',
      data: {
        submissionId: submission.id,
        status,
        passed: passedCount,
        total: totalCount,
        score,
        // Only send detailed results for VISIBLE test cases
        results: visibleResults.map((result, index) => ({
          testCase: index + 1,
          passed: result.passed,
          input: result.input,
          expectedOutput: result.expectedOutput,
          actualOutput: result.actualOutput,
          consoleOutput: result.consoleOutput || '',
          error: result.error,
          executionTime: result.executionTime,
          memory: result.memory,
        })),
        // Summary for hidden test cases (no input/output details)
        hiddenTestCases: {
          total: hiddenResults.length,
          passed: hiddenPassed,
        },
        // AI Evaluation results (if enabled)
        ...(aiEvalResult ? {
          aiEval: {
            enabled: true,
            score: aiEvalResult.score,
            passed: aiEvalResult.passed,
            feedback: aiEvalResult.feedback,
            weight: aiEvalConfig?.weight || 0,
            testCaseScore: testCaseScore,
          },
        } : {}),
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
      .select({
        id: submissions.id,
        taskId: submissions.taskId,
        contestId: submissions.contestId,
        language: submissions.language,
        status: submissions.status,
        passedTests: submissions.passedTests,
        totalTests: submissions.totalTests,
        executionTime: submissions.executionTime,
        memoryUsed: submissions.memoryUsed,
        score: submissions.score,
        submittedAt: submissions.submittedAt,
      })
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
    const taskId = parseInt(req.params.taskId as string);
    const userId = parseInt(req.params.userId as string);

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

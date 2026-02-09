import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
// Fix import path to point to actual db configuration
import { db } from '../config/database';
import { tasks, submissions, userTaskProgress, contestSettings } from '../db/schema';
import { eq, and, count, sql } from 'drizzle-orm';

export const getHint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, userCode, language, errorLogs } = req.body;
    const userId = (req as any).user.id;

    // Fetch task to get contest ID
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Fetch contest settings instead of task.aiConfig
    const [settings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, task.contestId));

    // If no settings found, use defaults (hints enabled by default)
    const aiHintsEnabled = settings?.aiHintsEnabled ?? true;
    const hintUnlockAfterSubmissions = settings?.hintUnlockAfterSubmissions ?? 0;
    const maxHintsAllowed = settings?.maxHintsAllowed ?? 3;

    if (!aiHintsEnabled) {
      res.status(403).json({ message: 'AI hints are disabled for this contest' });
      return;
    }

    // Check if user has exceeded max hints
    const [progress] = await db
      .select()
      .from(userTaskProgress)
      .where(and(eq(userTaskProgress.userId, userId), eq(userTaskProgress.taskId, taskId)));

    const hintsUsed = progress?.hintsUnlocked || 0;
    if (maxHintsAllowed > 0 && hintsUsed >= maxHintsAllowed) {
      res.status(403).json({ message: `You have reached the maximum of ${maxHintsAllowed} hints for this task` });
      return;
    }

    // Check submission threshold
    if (hintUnlockAfterSubmissions > 0) {
      const [submissionCount] = await db
        .select({ count: count() })
        .from(submissions)
        .where(and(eq(submissions.taskId, taskId), eq(submissions.userId, userId)));

      const currentCount = submissionCount?.count || 0;
      if (currentCount < hintUnlockAfterSubmissions) {
        res.status(403).json({
          message: `You need ${hintUnlockAfterSubmissions - currentCount} more submission(s) to unlock hints`
        });
        return;
      }
    }

    const hint = await aiService.generateHint(
      task.description,
      userCode,
      language,
      errorLogs,
      userId,
      parseInt(taskId),
      req.body.contestId ? parseInt(req.body.contestId) : undefined
    );

    // Track hint usage
    await db.insert(userTaskProgress)
      .values({
        userId,
        taskId,
        hintsUnlocked: 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userTaskProgress.userId, userTaskProgress.taskId],
        set: {
          hintsUnlocked: sql`${userTaskProgress.hintsUnlocked} + 1`,
          updatedAt: new Date(),
        },
      });

    res.json({ hint });
  } catch (error) {
    next(error);
  }
};

export const getSolution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, language } = req.body;
    const userId = (req as any).user.id;

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Fetch contest settings instead of task.aiConfig
    const [settings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, task.contestId));

    const aiHintsEnabled = settings?.aiHintsEnabled ?? true;

    if (!aiHintsEnabled) {
      res.status(403).json({ message: 'AI solutions are disabled for this contest' });
      return;
    }

    // For now, we don't have a solution threshold in contestSettings
    // Solutions can be disabled entirely or allowed freely
    // If you want to add a threshold, add it to contest_settings schema

    const solution = await aiService.generateSolution(
      task.description,
      language || 'javascript',
      userId,
      parseInt(taskId),
      req.body.contestId ? parseInt(req.body.contestId) : undefined
    );

    // Track solution usage
    await db.insert(userTaskProgress)
      .values({
        userId,
        taskId,
        solutionUnlocked: true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userTaskProgress.userId, userTaskProgress.taskId],
        set: {
          solutionUnlocked: true,
          updatedAt: new Date(),
        },
      });

    res.json({ solution });
  } catch (error) {
    next(error);
  }
};

export const evaluateCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, userCode, language, testResults } = req.body;

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const evaluation = await aiService.evaluateSubmission(task.description, userCode, language, JSON.stringify(testResults));
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
};

import { groqService } from '../services/groq.service';

// ... (existing functions)

export const generateCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, functionName, languages, inputFormat, outputFormat } = req.body;
    const userId = (req as any).user.id;

    if (!description || !functionName || !languages || languages.length === 0) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const generatedCode = await groqService.generateTaskCode({
      description,
      functionName,
      languages,
      inputFormat,
      outputFormat,
      userId // Pass userId for logging
    } as any);

    res.json(generatedCode);
  } catch (error) {
    next(error);
  }
};

export const generateTestCases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, boilerplateCode, wrapperCode, functionName, language, numberOfTestCases } = req.body;
    const userId = (req as any).user.id;

    console.log('🧪 generateTestCases request:', {
      userId,
      functionName,
      language,
      numberOfTestCases,
      hasDescription: !!description,
      hasBoilerplate: !!boilerplateCode,
      hasWrapper: !!wrapperCode,
    });

    if (!description || !functionName || !language) {
      res.status(400).json({ 
        success: false,
        message: 'Missing required fields: description, functionName, language are required' 
      });
      return;
    }

    const testCases = await groqService.generateTestCases({
      description,
      boilerplateCode: boilerplateCode || '',
      wrapperCode: wrapperCode || '',
      functionName,
      language,
      numberOfTestCases: numberOfTestCases || 5,
      userId // Pass userId for logging
    } as any);

    console.log('✅ Test cases generated successfully:', testCases.length);

    res.json({ success: true, testCases });
  } catch (error: any) {
    console.error('❌ generateTestCases error:', error.message);
    next(error);
  }
};

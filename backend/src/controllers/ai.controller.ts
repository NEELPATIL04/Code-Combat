import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
// Fix import path to point to actual db configuration
import { db } from '../config/database';
import { tasks, submissions, userTaskProgress } from '../db/schema';
import { eq, and, count, sql } from 'drizzle-orm';

export const getHint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, userCode, language, errorLogs } = req.body;
    const userId = (req as any).user.id;

    // Fetch task config
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (!task.aiConfig?.hintsEnabled) {
      res.status(403).json({ message: 'Hints are disabled for this task' });
      return;
    }

    if (task.aiConfig.hintThreshold > 0) {
      const [submissionCount] = await db
        .select({ count: count() })
        .from(submissions)
        .where(and(eq(submissions.taskId, taskId), eq(submissions.userId, userId)));

      const currentCount = submissionCount?.count || 0;
      if (currentCount < task.aiConfig.hintThreshold) {
        res.status(403).json({ message: `You need ${task.aiConfig.hintThreshold - currentCount} more submissions to unlock hint` });
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

    if (!task.aiConfig?.hintsEnabled) {
      res.status(403).json({ message: 'AI solutions are disabled for this task' });
      return;
    }

    if (task.aiConfig.solutionThreshold > 0) {
      const [submissionCount] = await db
        .select({ count: count() })
        .from(submissions)
        .where(and(eq(submissions.taskId, taskId), eq(submissions.userId, userId)));

      const currentCount = submissionCount?.count || 0;
      if (currentCount < task.aiConfig.solutionThreshold) {
        res.status(403).json({ message: `You need ${task.aiConfig.solutionThreshold - currentCount} more submissions to unlock solution` });
        return;
      }
    }

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

    if (!description || !functionName || !languages || languages.length === 0) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const generatedCode = await groqService.generateTaskCode({
      description,
      functionName,
      languages,
      inputFormat,
      outputFormat
    });

    res.json(generatedCode);
  } catch (error) {
    next(error);
  }
};

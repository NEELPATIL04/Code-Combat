import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
// Fix import path to point to actual db configuration
import { db } from '../config/database';
import { tasks, submissions, userTaskProgress, contestSettings } from '../db/schema';
import { eq, and, count, } from 'drizzle-orm';

export const getHint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, userCode, language, errorLogs } = req.body;
    const userId = (req as any).user.userId;

    console.log(`📝 AI Hint request - User: ${userId}, Task: ${taskId}, Language: ${language}`);
    console.log(`📝 Request body:`, JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!taskId) {
      res.status(400).json({ message: 'taskId is required' });
      return;
    }
    if (!userCode) {
      res.status(400).json({ message: 'userCode is required' });
      return;
    }
    if (!language) {
      res.status(400).json({ message: 'language is required' });
      return;
    }

    // Parse taskId to integer
    const taskIdInt = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    if (isNaN(taskIdInt)) {
      res.status(400).json({ message: 'Invalid taskId format' });
      return;
    }

    // Fetch task to get contest ID
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskIdInt));
    if (!task) {
      console.error(`❌ Task ${taskId} not found for hint request`);
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
      .where(and(eq(userTaskProgress.userId, userId), eq(userTaskProgress.taskId, taskIdInt)));

    const hintsUsed = progress?.hintsUnlocked || 0;
    console.log(`📊 User has used ${hintsUsed} hints, max allowed: ${maxHintsAllowed}`);

    if (maxHintsAllowed > 0 && hintsUsed >= maxHintsAllowed) {
      console.log(`⛔ User reached max hints limit`);
      res.status(403).json({ message: `You have reached the maximum of ${maxHintsAllowed} hints for this task` });
      return;
    }

    // Check submission threshold
    if (hintUnlockAfterSubmissions > 0) {
      const [submissionCount] = await db
        .select({ count: count() })
        .from(submissions)
        .where(and(eq(submissions.taskId, taskIdInt), eq(submissions.userId, userId)));

      const currentCount = Number(submissionCount?.count || 0);
      console.log(`📊 User has ${currentCount} submissions, required: ${hintUnlockAfterSubmissions}`);

      if (currentCount < hintUnlockAfterSubmissions) {
        console.log(`⛔ User needs ${hintUnlockAfterSubmissions - currentCount} more submissions`);
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
      taskIdInt,
      req.body.contestId ? parseInt(req.body.contestId) : undefined
    );

    // Track hint usage (reuse progress variable from earlier check)
    console.log(`📊 Tracking hint usage - userId: ${userId}, taskId: ${taskIdInt}`);

    if (progress) {
      // Update existing record
      await db
        .update(userTaskProgress)
        .set({
          hintsUnlocked: (progress.hintsUnlocked || 0) + 1,
          updatedAt: new Date(),
        })
        .where(and(eq(userTaskProgress.userId, userId), eq(userTaskProgress.taskId, taskIdInt)));
      console.log(`✅ Updated hints count to ${(progress.hintsUnlocked || 0) + 1}`);
    } else {
      // Insert new record
      await db.insert(userTaskProgress).values({
        userId: userId,
        taskId: taskIdInt,
        hintsUnlocked: 1,
        solutionUnlocked: false,
        updatedAt: new Date(),
      });
      console.log(`✅ Created new progress record with 1 hint`);
    }

    console.log(`✅ Hint generated successfully for user ${userId}, task ${taskIdInt}`);
    res.json({ hint });
  } catch (error) {
    console.error(`❌ Error generating hint:`, error);
    next(error);
  }
};

export const getSolution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId, language } = req.body;
    const userId = (req as any).user.userId;

    console.log(`📝 AI Solution request - User: ${userId}, Task: ${taskId}, Language: ${language}`);
    console.log(`📝 Request body:`, JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!taskId) {
      res.status(400).json({ message: 'taskId is required' });
      return;
    }
    if (!language) {
      console.error(`❌ Missing language parameter for solution request`);
      res.status(400).json({ message: 'Language parameter is required' });
      return;
    }

    // Parse taskId to integer
    const taskIdInt = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    if (isNaN(taskIdInt)) {
      res.status(400).json({ message: 'Invalid taskId format' });
      return;
    }

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskIdInt));
    if (!task) {
      console.error(`❌ Task ${taskId} not found for solution request`);
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    console.log(`📋 Task found: "${task.title}"`);
    console.log(`📋 Description length: ${task.description?.length || 0} characters`);

    // Fetch contest settings instead of task.aiConfig
    const [settings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, task.contestId));

    const aiHintsEnabled = settings?.aiHintsEnabled ?? true;
    const solutionUnlockAfterSubmissions = settings?.solutionUnlockAfterSubmissions ?? 0;

    if (!aiHintsEnabled) {
      res.status(403).json({ message: 'AI solutions are disabled for this contest' });
      return;
    }

    // Check submission threshold for solution unlock
    if (solutionUnlockAfterSubmissions > 0) {
      const [submissionCount] = await db
        .select({ count: count() })
        .from(submissions)
        .where(and(eq(submissions.taskId, taskIdInt), eq(submissions.userId, userId)));

      const currentCount = Number(submissionCount?.count || 0);
      console.log(`📊 User has ${currentCount} submissions, solution requires: ${solutionUnlockAfterSubmissions}`);

      if (currentCount < solutionUnlockAfterSubmissions) {
        console.log(`⛔ User needs ${solutionUnlockAfterSubmissions - currentCount} more submissions to unlock solution`);
        res.status(403).json({
          message: `You need ${solutionUnlockAfterSubmissions - currentCount} more submission(s) to unlock the solution`
        });
        return;
      }
    }

    // Get boilerplate code for the requested language
    const boilerplate = task.boilerplateCode?.[language] || task.boilerplateCode?.[language.toLowerCase()] || '';

    const solution = await aiService.generateSolution(
      task.description,
      language || 'javascript',
      boilerplate,
      userId,
      taskIdInt,
      req.body.contestId ? parseInt(req.body.contestId) : undefined
    );

    // Track solution usage
    console.log(`📊 Tracking solution usage - userId: ${userId}, taskId: ${taskIdInt}`);

    // Check if record exists
    const [existingProgress] = await db
      .select()
      .from(userTaskProgress)
      .where(and(eq(userTaskProgress.userId, userId), eq(userTaskProgress.taskId, taskIdInt)));

    if (existingProgress) {
      // Update existing record
      await db
        .update(userTaskProgress)
        .set({
          solutionUnlocked: true,
          updatedAt: new Date(),
        })
        .where(and(eq(userTaskProgress.userId, userId), eq(userTaskProgress.taskId, taskIdInt)));
    } else {
      // Insert new record
      await db.insert(userTaskProgress).values({
        userId: userId,
        taskId: taskIdInt,
        hintsUnlocked: 0,
        solutionUnlocked: true,
        updatedAt: new Date(),
      });
    }

    console.log(`✅ Solution generated successfully for user ${userId}, task ${taskIdInt}`);
    res.json({ solution });
  } catch (error) {
    console.error(`❌ Error generating solution:`, error);
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

    // Check contest settings - aiModeEnabled controls AI analysis
    const [settings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, task.contestId));

    const aiModeEnabled = settings?.aiModeEnabled ?? true;

    if (!aiModeEnabled) {
      res.status(403).json({ message: 'AI code analysis is disabled for this contest' });
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
    const userId = (req as any).user?.userId;

    console.log('🎨 generateCode request:', {
      userId,
      functionName,
      languages,
      hasDescription: !!description,
      hasInputFormat: !!inputFormat,
      hasOutputFormat: !!outputFormat
    });

    if (!description || !functionName || !languages || languages.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: description, functionName, and languages are required' 
      });
    }

    const generatedCode = await groqService.generateTaskCode({
      description,
      functionName,
      languages,
      inputFormat,
      outputFormat,
      userId // Pass userId for logging
    } as any);

    console.log('✅ Code generated successfully for languages:', Object.keys(generatedCode));

    res.json({ success: true, ...generatedCode });
  } catch (error: any) {
    console.error('❌ generateCode error:', error.message);
    console.error('Stack trace:', error.stack);
    next(error);
  }
};

export const generateTestCases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, boilerplateCode, wrapperCode, functionName, language, numberOfTestCases } = req.body;
    const userId = (req as any).user.userId;

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

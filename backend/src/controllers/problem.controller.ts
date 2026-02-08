import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { problems, problemSubmissions, userProblemProgress } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

/**
 * Problem Controller
 * Manages standalone coding problems (LeetCode-style)
 */

/**
 * Get all problems with filters
 * GET /api/problems
 */
export const getAllProblems = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { difficulty } = req.query;
    const userId = (req as any).user?.userId;

    // Build query conditions
    const conditions: any[] = [eq(problems.isActive, true)];

    if (difficulty && (difficulty === 'Easy' || difficulty === 'Medium' || difficulty === 'Hard')) {
      conditions.push(eq(problems.difficulty, difficulty));
    }

    // Fetch problems with user progress if authenticated
    let problemsList;

    if (userId) {
      // Join with user progress to show solved/attempted status
      problemsList = await db
        .select({
          id: problems.id,
          title: problems.title,
          slug: problems.slug,
          difficulty: problems.difficulty,
          tags: problems.tags,
          companies: problems.companies,
          totalSubmissions: problems.totalSubmissions,
          acceptedSubmissions: problems.acceptedSubmissions,
          isPremium: problems.isPremium,
          userStatus: userProblemProgress.status,
          userAttempts: userProblemProgress.attempts,
        })
        .from(problems)
        .leftJoin(
          userProblemProgress,
          and(
            eq(userProblemProgress.problemId, problems.id),
            eq(userProblemProgress.userId, userId)
          )
        )
        .where(and(...conditions))
        .orderBy(problems.id);
    } else {
      // Public view without user progress
      problemsList = await db
        .select({
          id: problems.id,
          title: problems.title,
          slug: problems.slug,
          difficulty: problems.difficulty,
          tags: problems.tags,
          companies: problems.companies,
          totalSubmissions: problems.totalSubmissions,
          acceptedSubmissions: problems.acceptedSubmissions,
          isPremium: problems.isPremium,
        })
        .from(problems)
        .where(and(...conditions))
        .orderBy(problems.id);
    }

    // Calculate acceptance rate
    const problemsWithStats = problemsList.map(problem => ({
      ...problem,
      acceptanceRate:
        problem.totalSubmissions > 0
          ? ((problem.acceptedSubmissions / problem.totalSubmissions) * 100).toFixed(1)
          : '0.0',
    }));

    return res.status(200).json({
      success: true,
      count: problemsWithStats.length,
      problems: problemsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single problem by ID or slug
 * GET /api/problems/:identifier
 */
export const getProblemById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { identifier } = req.params;
    const userId = (req as any).user?.userId;

    // Check if identifier is a number (ID) or string (slug)
    const isId = !isNaN(parseInt(identifier as string));
    const condition = isId
      ? eq(problems.id, parseInt(identifier as string))
      : eq(problems.slug, identifier as string);

    const [problem] = await db
      .select()
      .from(problems)
      .where(condition)
      .limit(1);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Get user progress if authenticated
    let userProgress = null;
    if (userId) {
      [userProgress] = await db
        .select()
        .from(userProblemProgress)
        .where(
          and(
            eq(userProblemProgress.problemId, problem.id),
            eq(userProblemProgress.userId, userId)
          )
        )
        .limit(1);
    }

    return res.status(200).json({
      success: true,
      problem: {
        ...problem,
        userProgress,
        acceptanceRate:
          problem.totalSubmissions > 0
            ? ((problem.acceptedSubmissions / problem.totalSubmissions) * 100).toFixed(1)
            : '0.0',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new problem (Admin only)
 * POST /api/problems
 */
export const createProblem = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = (req as any).user?.userId;
    const {
      title,
      slug,
      description,
      difficulty,
      tags,
      hints,
      companies,
      starterCode,
      functionSignature,
      testCases,
      isPremium,
    } = req.body;

    if (!title || !slug || !description || !difficulty || !testCases) {
      return res.status(400).json({
        message: 'Title, slug, description, difficulty, and test cases are required',
      });
    }

    const [newProblem] = await db
      .insert(problems)
      .values({
        title,
        slug,
        description,
        difficulty,
        tags: tags || [],
        hints: hints || [],
        companies: companies || [],
        starterCode: starterCode || {},
        functionSignature: functionSignature || {},
        testCases,
        isPremium: isPremium || false,

        // New fields
        allowedLanguages: req.body.allowedLanguages || [],
        testRunnerTemplate: req.body.testRunnerTemplate || {},
        aiConfig: req.body.aiConfig || {
          hintsEnabled: true,
          hintThreshold: 2,
          solutionThreshold: 5
        },

        createdBy: userId,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      problem: newProblem,
    });
  } catch (error: any) {
    if (error.code === '23505') {
      // Unique constraint violation
      return res.status(400).json({ message: 'Problem slug already exists' });
    }
    next(error);
  }
};

/**
 * Update problem (Admin only)
 * PUT /api/problems/:id
 */
export const updateProblem = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const problemId = parseInt(req.params.id as string);
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.totalSubmissions;
    delete updateData.acceptedSubmissions;

    updateData.updatedAt = new Date();

    const [updatedProblem] = await db
      .update(problems)
      .set(updateData)
      .where(eq(problems.id, problemId))
      .returning();

    if (!updatedProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      problem: updatedProblem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete problem (Admin only)
 * DELETE /api/problems/:id
 */
export const deleteProblem = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const problemId = parseInt(req.params.id as string);

    await db.delete(problems).where(eq(problems.id, problemId));

    return res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit solution to problem
 * POST /api/problems/:id/submit
 */
export const submitProblemSolution = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const problemId = parseInt(req.params.id as string);
    const userId = (req as any).user?.userId;
    const { code, language, status, testCasesPassed, totalTestCases, executionTime, memoryUsed, timeSpent, errorMessage } = req.body;

    if (!code || !language || !status) {
      return res.status(400).json({ message: 'Code, language, and status are required' });
    }

    // Insert submission
    const [submission] = await db
      .insert(problemSubmissions)
      .values({
        problemId,
        userId,
        code,
        language,
        status,
        testCasesPassed: testCasesPassed || 0,
        totalTestCases: totalTestCases || 0,
        executionTime,
        memoryUsed,
        timeSpent,
        errorMessage,
      })
      .returning();

    // Update problem statistics
    await db
      .update(problems)
      .set({
        totalSubmissions: sql`${problems.totalSubmissions} + 1`,
        acceptedSubmissions: status === 'accepted' ? sql`${problems.acceptedSubmissions} + 1` : problems.acceptedSubmissions,
      })
      .where(eq(problems.id, problemId));

    // Update or create user progress
    const [existingProgress] = await db
      .select()
      .from(userProblemProgress)
      .where(
        and(
          eq(userProblemProgress.userId, userId),
          eq(userProblemProgress.problemId, problemId)
        )
      )
      .limit(1);

    if (existingProgress) {
      // Update existing progress
      await db
        .update(userProblemProgress)
        .set({
          status: status === 'accepted' ? 'solved' : existingProgress.status,
          attempts: sql`${userProblemProgress.attempts} + 1`,
          bestTime: executionTime && (!existingProgress.bestTime || executionTime < existingProgress.bestTime) ? executionTime : existingProgress.bestTime,
          bestMemory: memoryUsed && (!existingProgress.bestMemory || memoryUsed < existingProgress.bestMemory) ? memoryUsed : existingProgress.bestMemory,
          solvedAt: status === 'accepted' && !existingProgress.solvedAt ? new Date() : existingProgress.solvedAt,
          lastAttemptAt: new Date(),
        })
        .where(eq(userProblemProgress.id, existingProgress.id));
    } else {
      // Create new progress record
      await db.insert(userProblemProgress).values({
        userId,
        problemId,
        status: status === 'accepted' ? 'solved' : 'attempted',
        attempts: 1,
        bestTime: executionTime,
        bestMemory: memoryUsed,
        solvedAt: status === 'accepted' ? new Date() : null,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Solution submitted successfully',
      submission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's submissions for a problem
 * GET /api/problems/:id/submissions
 */
export const getProblemSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const problemId = parseInt(req.params.id as string);
    const userId = (req as any).user?.userId;

    const submissions = await db
      .select()
      .from(problemSubmissions)
      .where(
        and(
          eq(problemSubmissions.problemId, problemId),
          eq(problemSubmissions.userId, userId)
        )
      )
      .orderBy(desc(problemSubmissions.submittedAt));

    return res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's problem statistics
 * GET /api/problems/stats
 */
export const getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const userId = (req as any).user?.userId;

    // Get solved problems count by difficulty
    const progress = await db
      .select({
        difficulty: problems.difficulty,
        count: sql<number>`count(*)`,
      })
      .from(userProblemProgress)
      .innerJoin(problems, eq(userProblemProgress.problemId, problems.id))
      .where(
        and(
          eq(userProblemProgress.userId, userId),
          eq(userProblemProgress.status, 'solved')
        )
      )
      .groupBy(problems.difficulty);

    const stats = {
      totalSolved: progress.reduce((sum, p) => sum + Number(p.count), 0),
      easy: progress.find(p => p.difficulty === 'Easy')?.count || 0,
      medium: progress.find(p => p.difficulty === 'Medium')?.count || 0,
      hard: progress.find(p => p.difficulty === 'Hard')?.count || 0,
    };

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

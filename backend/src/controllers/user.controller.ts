import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { contestParticipants, contests, submissions, userTaskProgress, tasks, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Get all users (for admin/participant selection)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      status: users.status,
    }).from(users);
    res.json({ users: allUsers });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      status: users.status,
    }).from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const getUserContestHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const history = await db
      .select({
        contestId: contests.id,
        title: contests.title,
        difficulty: contests.difficulty,
        status: contests.status, // Contest status
        duration: contests.duration,
        score: contestParticipants.score,
        rank: contestParticipants.rank,
        startedAt: contestParticipants.startedAt,
        completedAt: contestParticipants.completedAt,
        scheduledStartTime: contests.scheduledStartTime,
      })
      .from(contestParticipants)
      .innerJoin(contests, eq(contestParticipants.contestId, contests.id))
      .where(eq(contestParticipants.userId, userId))
      .orderBy(desc(contestParticipants.startedAt));

    res.json({ history });
  } catch (error) {
    next(error);
  }
};

export const getUserContestDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const contestId = parseInt(req.params.contestId, 10);

    if (isNaN(contestId)) {
      return res.status(400).json({ message: 'Invalid contest ID' });
    }

    // 1. Get Contest Basic Info & Participant Stats
    const [contestInfo] = await db
      .select({
        title: contests.title,
        difficulty: contests.difficulty,
        score: contestParticipants.score,
        rank: contestParticipants.rank,
        startedAt: contestParticipants.startedAt,
        completedAt: contestParticipants.completedAt,
      })
      .from(contestParticipants)
      .innerJoin(contests, eq(contestParticipants.contestId, contests.id))
      .where(and(eq(contestParticipants.userId, userId), eq(contestParticipants.contestId, contestId)));

    if (!contestInfo) {
      return res.status(404).json({ message: 'Contest participation not found' });
    }

    // 2. Get Submissions & Task Stats
    // We want to show: Task Name, Status, Score, Time Taken (mock/derived), Hints Used, Solution Used

    const taskStats = await db
      .select({
        taskId: tasks.id,
        taskTitle: tasks.title,
        maxPoints: tasks.maxPoints,
        hintsUnlocked: userTaskProgress.hintsUnlocked,
        solutionUnlocked: userTaskProgress.solutionUnlocked,
      })
      .from(tasks)
      .leftJoin(userTaskProgress, and(eq(userTaskProgress.taskId, tasks.id), eq(userTaskProgress.userId, userId)))
      .where(eq(tasks.contestId, contestId));

    // Fetch submissions separately to get status/score per task
    const userSubmissions = await db
      .select({
        taskId: submissions.taskId,
        score: submissions.score,
        status: submissions.status,
        passed: submissions.passedTests,
        total: submissions.totalTests,
        createdAt: submissions.submittedAt,
      })
      .from(submissions)
      .where(and(eq(submissions.userId, userId), eq(submissions.contestId, contestId)))
      .orderBy(desc(submissions.submittedAt));

    // Merge data
    const detailedTasks = taskStats.map(task => {
      // Get best submission for this task
      const taskSubs = userSubmissions.filter(s => s.taskId === task.taskId);
      const bestSub = taskSubs.find(s => s.status === 'accepted') || taskSubs[0]; // Simplified "best"

      return {
        ...task,
        status: bestSub?.status || 'not_attempted',
        score: bestSub?.score || 0,
        passedTests: bestSub?.passed || 0,
        totalTests: bestSub?.total || 0,
        lastSubmittedAt: bestSub?.createdAt || null,
        hintsUsed: task.hintsUnlocked || 0,
        solutionUsed: task.solutionUnlocked || false,
      };
    });

    res.json({
      contest: contestInfo,
      tasks: detailedTasks
    });

  } catch (error) {
    next(error);
  }
};

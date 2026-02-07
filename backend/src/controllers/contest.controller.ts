import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { contests, tasks, contestParticipants, users, testCases } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { hashPassword } from '../utils/password.util';

/**
 * Contest Controller
 * Handles all contest-related operations
 */

/**
 * Create a new contest
 * POST /api/contests
 */
export const createContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📝 Received create contest request');
    console.log('Query:', req.query);
    console.log('Body keys:', Object.keys(req.body));

    const { title, description, difficulty, duration, startPassword, contestTasks, participantIds, fullScreenMode } = req.body;

    console.log(`Title: ${title}, Duration: ${duration}, Tasks: ${contestTasks?.length || 0}, Full Screen: ${fullScreenMode}`);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate required fields
    if (!title || !duration) {
      return res.status(400).json({ message: 'Title and duration are required' });
    }

    // Hash start password if provided
    let hashedPassword = null;
    if (startPassword) {
      hashedPassword = await hashPassword(startPassword);
    }

    // Create contest
    const [contest] = await db.insert(contests).values({
      title,
      description: description || '',
      difficulty: difficulty || 'Medium',
      duration: parseInt(duration),
      startPassword: hashedPassword,
      createdBy: userId,
      status: 'upcoming',
      fullScreenMode: fullScreenMode !== undefined ? fullScreenMode : true,
    }).returning();

    // Create tasks if provided
    if (contestTasks && Array.isArray(contestTasks) && contestTasks.length > 0) {
      const taskValues = contestTasks.map((task: any, index: number) => {
        console.log(`Task ${index}: ${task.title} - Allowed Languages:`, task.allowedLanguages);
        return {
          contestId: contest.id,
          title: task.title,
          description: task.description,
          difficulty: task.difficulty || difficulty || 'Medium',
          maxPoints: task.maxPoints || 100,
          allowedLanguages: task.allowedLanguages || [],
          orderIndex: index,
        };
      });
      await db.insert(tasks).values(taskValues);
      console.log('Tasks inserted successfully');
    } else {
      console.log('No tasks provided for creation');
    }

    // Add participants if provided
    if (participantIds && Array.isArray(participantIds) && participantIds.length > 0) {
      const participantValues = participantIds.map((userId: number) => ({
        contestId: contest.id,
        userId,
      }));
      await db.insert(contestParticipants).values(participantValues);
    }

    res.status(201).json({
      message: 'Contest created successfully',
      contest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all contests (with filters)
 * GET /api/contests
 */
export const getAllContests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    let query = db.select().from(contests);

    // Filter by status if provided
    if (status && typeof status === 'string') {
      query = query.where(eq(contests.status, status as any));
    }

    const allContests = await query;

    // Get participant counts for each contest
    const contestsWithCounts = await Promise.all(
      allContests.map(async (contest) => {
        const participants = await db
          .select()
          .from(contestParticipants)
          .where(eq(contestParticipants.contestId, contest.id));

        const contestTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.contestId, contest.id));

        return {
          ...contest,
          participantCount: participants.length,
          taskCount: contestTasks.length,
        };
      })
    );

    res.status(200).json({
      count: contestsWithCounts.length,
      contests: contestsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single contest by ID
 * GET /api/contests/:id
 */
export const getContestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get tasks
    const contestTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.contestId, contestId))
      .orderBy(tasks.orderIndex);

    console.log(`Fetched ${contestTasks.length} tasks for contest ${contestId}`);

    // Get participants with user details
    const participants = await db
      .select({
        id: contestParticipants.id,
        userId: contestParticipants.userId,
        hasStarted: contestParticipants.hasStarted,
        startedAt: contestParticipants.startedAt,
        score: contestParticipants.score,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(contestParticipants)
      .leftJoin(users, eq(contestParticipants.userId, users.id))
      .where(eq(contestParticipants.contestId, contestId));

    res.status(200).json({
      contest: {
        ...contest,
        tasks: await Promise.all(contestTasks.map(async (task) => {
          const taskTestCases = await db
            .select()
            .from(testCases)
            .where(eq(testCases.taskId, task.id));
          return { ...task, testCases: taskTestCases };
        })),
        participants,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update contest
 * PUT /api/contests/:id
 */
export const updateContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id);
    const { title, description, difficulty, duration, status, startPassword, contestTasks, fullScreenMode } = req.body;

    const [existingContest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!existingContest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Build update object
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (difficulty) updateData.difficulty = difficulty;
    if (duration) updateData.duration = parseInt(duration);
    if (status) updateData.status = status;
    if (startPassword) {
      updateData.startPassword = await hashPassword(startPassword);
    }
    if (fullScreenMode !== undefined) updateData.fullScreenMode = fullScreenMode;
    updateData.updatedAt = new Date();

    const [updatedContest] = await db
      .update(contests)
      .set(updateData)
      .where(eq(contests.id, contestId))
      .returning();

    // Update tasks if provided
    if (contestTasks && Array.isArray(contestTasks)) {
      console.log('Updating tasks for contest:', contestId, 'Count:', contestTasks.length);
      // Delete existing tasks
      await db.delete(tasks).where(eq(tasks.contestId, contestId));

      // Insert new tasks
      if (contestTasks.length > 0) {
        const taskValues = contestTasks.map((task: any, index: number) => {
          console.log(`Updating Task ${index}: ${task.title} - Allowed Languages:`, task.allowedLanguages);
          return {
            contestId: contestId,
            title: task.title,
            description: task.description,
            difficulty: task.difficulty || difficulty || 'Medium',
            maxPoints: task.maxPoints || 100,
            allowedLanguages: task.allowedLanguages || [],
            orderIndex: index,
          };
        });
        await db.insert(tasks).values(taskValues);
        console.log('Tasks replaced successfully');
      }
    }

    res.status(200).json({
      message: 'Contest updated successfully',
      contest: updatedContest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete contest
 * DELETE /api/contests/:id
 */
export const deleteContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id);

    const [existingContest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!existingContest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Delete associated tasks
    await db.delete(tasks).where(eq(tasks.contestId, contestId));

    // Delete associated participants
    await db.delete(contestParticipants).where(eq(contestParticipants.contestId, contestId));

    // Delete contest
    await db.delete(contests).where(eq(contests.id, contestId));

    res.status(200).json({ message: 'Contest deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Add participants to contest
 * POST /api/contests/:id/participants
 */
export const addParticipants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id);
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get existing participants
    const existingParticipants = await db
      .select()
      .from(contestParticipants)
      .where(eq(contestParticipants.contestId, contestId));

    const existingUserIds = existingParticipants.map(p => p.userId);

    // Filter out already assigned users
    const newUserIds = userIds.filter((id: number) => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return res.status(400).json({ message: 'All users are already participants' });
    }

    // Add new participants
    const participantValues = newUserIds.map((userId: number) => ({
      contestId,
      userId,
    }));
    await db.insert(contestParticipants).values(participantValues);

    res.status(200).json({
      message: `${newUserIds.length} participant(s) added successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove participant from contest
 * DELETE /api/contests/:id/participants/:userId
 */
export const removeParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    await db
      .delete(contestParticipants)
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.userId, userId)
        )
      );

    res.status(200).json({ message: 'Participant removed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Start contest (for admin)
 * POST /api/contests/:id/start
 */
export const startContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.isStarted) {
      return res.status(400).json({ message: 'Contest already started' });
    }

    const [updatedContest] = await db
      .update(contests)
      .set({
        isStarted: true,
        status: 'active',
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contests.id, contestId))
      .returning();

    res.status(200).json({
      message: 'Contest started successfully',
      contest: updatedContest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get contests assigned to current user (player)
 * GET /api/contests/my-contests
 */
export const getMyContests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get all contest IDs assigned to this user
    const assignedContests = await db
      .select({
        contestId: contestParticipants.contestId,
        hasStarted: contestParticipants.hasStarted,
        startedAt: contestParticipants.startedAt,
        score: contestParticipants.score,
      })
      .from(contestParticipants)
      .where(eq(contestParticipants.userId, userId));

    if (assignedContests.length === 0) {
      return res.status(200).json({ contests: [] });
    }

    // Get contest details
    const contestIds = assignedContests.map(c => c.contestId);
    const contestDetails = await db
      .select()
      .from(contests)
      .where(inArray(contests.id, contestIds));

    // Combine contest details with participant info
    const myContests = contestDetails.map(contest => {
      const participantInfo = assignedContests.find(ac => ac.contestId === contest.id);
      return {
        ...contest,
        hasStarted: participantInfo?.hasStarted || false,
        startedAt: participantInfo?.startedAt,
        score: participantInfo?.score || 0,
      };
    });

    res.status(200).json({ contests: myContests });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tasks for a specific contest
 * GET /api/contests/:id/tasks
 */
export const getContestTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contestId = parseInt(req.params.id as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      res.status(404).json({ message: 'Contest not found' });
      return;
    }

    // Get all tasks for this contest
    const contestTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.contestId, contestId))
      .orderBy(tasks.orderIndex);

    res.status(200).json({
      contest: {
        id: contest.id,
        title: contest.title,
        difficulty: contest.difficulty,
        duration: contest.duration,
        status: contest.status,
        fullScreenMode: contest.fullScreenMode,
      },
      tasks: contestTasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single task by ID
 * GET /api/tasks/:id
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const taskId = parseInt(req.params.id as string);

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Get contest info
    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, task.contestId));

    res.status(200).json({
      task,
      contest: contest ? {
        id: contest.id,
        title: contest.title,
        duration: contest.duration,
        status: contest.status,
      } : null,
    });
  } catch (error) {
    next(error);
  }
};

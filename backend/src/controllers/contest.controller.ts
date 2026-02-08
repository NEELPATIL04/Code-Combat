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

    const { title, description, difficulty, duration, startPassword, contestTasks, tasks: tasksFromBody, participantIds, fullScreenMode, scheduledStartTime, endTime } = req.body;

    // Support both 'tasks' and 'contestTasks' parameter names
    const tasksList = contestTasks || tasksFromBody;

    console.log(`Title: ${title}, Duration: ${duration}, Tasks: ${tasksList?.length || 0}, Full Screen: ${fullScreenMode}`);
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
      scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
      endTime: endTime ? new Date(endTime) : null,
    }).returning();

    // Create tasks if provided
    if (tasksList && Array.isArray(tasksList) && tasksList.length > 0) {
      console.log(`Processing ${tasksList.length} tasks...`);

      for (const [index, task] of tasksList.entries()) {
        console.log(`Creating Task ${index}: ${task.title}`);

        // Insert task
        const [newTask] = await db.insert(tasks).values({
          contestId: contest.id,
          title: task.title,
          description: task.description,
          difficulty: task.difficulty || difficulty || 'Medium',
          maxPoints: task.maxPoints || 100,
          allowedLanguages: task.allowedLanguages || [],
          orderIndex: index,
          // New fields
          functionName: task.functionName,
          boilerplateCode: task.boilerplateCode,
          testRunnerTemplate: task.testRunnerTemplate, // This maps to wrapperCode from frontend
          aiConfig: task.aiConfig
        }).returning();

        // Insert test cases if provided
        if (task.testCases && Array.isArray(task.testCases) && task.testCases.length > 0) {
          const testCaseValues = task.testCases.map((tc: any, tcIndex: number) => ({
            taskId: newTask.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden || false,
            orderIndex: tcIndex
          }));

          await db.insert(testCases).values(testCaseValues);
          console.log(`Inserted ${testCaseValues.length} test cases for task ${newTask.id}`);
        }
      }
      console.log('All tasks and test cases created successfully');
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

    return res.status(201).json({
      message: 'Contest created successfully',
      contest,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get all contests (with filters)
 * GET /api/contests
 */
export const getAllContests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    // Filter by status if provided
    const statusFilter = (status && typeof status === 'string')
      ? eq(contests.status, status as any)
      : undefined;

    const allContests = await db.select().from(contests).where(statusFilter);

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

    return res.status(200).json({
      count: contestsWithCounts.length,
      contests: contestsWithCounts,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single contest by ID
 * GET /api/contests/:id
 */
export const getContestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);

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

    return res.status(200).json({
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
    return next(error);
  }
};

/**
 * Update contest
 * PUT /api/contests/:id
 */
export const updateContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const { title, description, difficulty, duration, status, startPassword, contestTasks, tasks: tasksFromBody, fullScreenMode, scheduledStartTime, endTime } = req.body;

    // Support both 'tasks' and 'contestTasks' parameter names
    const tasksList = contestTasks || tasksFromBody;

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

    if (scheduledStartTime !== undefined) {
      updateData.scheduledStartTime = scheduledStartTime ? new Date(scheduledStartTime) : null;
    }
    if (endTime !== undefined) {
      updateData.endTime = endTime ? new Date(endTime) : null;
    }

    updateData.updatedAt = new Date();

    const [updatedContest] = await db
      .update(contests)
      .set(updateData)
      .where(eq(contests.id, contestId))
      .returning();

    // Update tasks if provided
    if (tasksList && Array.isArray(tasksList)) {
      console.log('Updating tasks for contest:', contestId, 'Count:', tasksList.length);

      // Get existing task IDs to delete their test cases first (if no cascade)
      const existingTasks = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.contestId, contestId));
      if (existingTasks.length > 0) {
        const taskIds = existingTasks.map(t => t.id);
        await db.delete(testCases).where(inArray(testCases.taskId, taskIds));
      }

      // Delete existing tasks
      await db.delete(tasks).where(eq(tasks.contestId, contestId));

      // Insert new tasks
      if (tasksList.length > 0) {
        for (const [index, task] of tasksList.entries()) {
          console.log(`Creating Task ${index}: ${task.title}`);

          // Insert task
          const [newTask] = await db.insert(tasks).values({
            contestId: contestId,
            title: task.title,
            description: task.description,
            difficulty: task.difficulty || difficulty || 'Medium',
            maxPoints: task.maxPoints || 100,
            allowedLanguages: task.allowedLanguages || [],
            orderIndex: index,
            // New fields
            functionName: task.functionName,
            boilerplateCode: task.boilerplateCode,
            testRunnerTemplate: task.testRunnerTemplate,
            aiConfig: task.aiConfig
          }).returning();

          // Insert test cases if provided
          if (task.testCases && Array.isArray(task.testCases) && task.testCases.length > 0) {
            const testCaseValues = task.testCases.map((tc: any, tcIndex: number) => ({
              taskId: newTask.id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden || false,
              orderIndex: tcIndex
            }));

            await db.insert(testCases).values(testCaseValues);
            console.log(`Inserted ${testCaseValues.length} test cases for task ${newTask.id}`);
          }
        }
        console.log('Tasks and test cases replaced successfully');
      }
    }

    // Update participants if provided
    // Check for both 'participants' (from frontend FormData) and 'participantIds' (consistency)
    const newParticipantsRaw = req.body.participants || req.body.participantIds;

    if (newParticipantsRaw && Array.isArray(newParticipantsRaw)) {
      // Deduplicate participants
      const newParticipants = [...new Set(newParticipantsRaw)];
      console.log('Updating participants for contest:', contestId, 'Count:', newParticipants.length);

      // Delete existing participants
      await db.delete(contestParticipants).where(eq(contestParticipants.contestId, contestId));

      // Insert new participants
      if (newParticipants.length > 0) {
        const participantValues = newParticipants.map((userId: any) => ({
          contestId,
          userId: Number(userId),
        }));
        await db.insert(contestParticipants).values(participantValues);
        console.log('Participants updated successfully');
      }
    }

    return res.status(200).json({
      message: 'Contest updated successfully',
      contest: updatedContest,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete contest
 * DELETE /api/contests/:id
 */
export const deleteContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);

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

    return res.status(200).json({ message: 'Contest deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add participants to contest
 * POST /api/contests/:id/participants
 */
export const addParticipants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const { userIds: userIdsRaw } = req.body;

    if (!userIdsRaw || !Array.isArray(userIdsRaw) || userIdsRaw.length === 0) {
      return res.status(400).json({ message: 'User IDs are required' });
    }

    // Deduplicate input user IDs
    const userIds = [...new Set(userIdsRaw.map((id: any) => Number(id)))];

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

    return res.status(200).json({
      message: `${newUserIds.length} participant(s) added successfully`,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Remove participant from contest
 * DELETE /api/contests/:id/participants/:userId
 */
export const removeParticipant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const userId = parseInt(req.params.userId as string);

    await db
      .delete(contestParticipants)
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.userId, userId)
        )
      );

    return res.status(200).json({ message: 'Participant removed successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Start contest (for admin)
 * POST /api/contests/:id/start
 */
export const startContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);

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

    return res.status(200).json({
      message: 'Contest started successfully',
      contest: updatedContest,
    });
  } catch (error) {
    return next(error);
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

    return res.status(200).json({ contests: myContests });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get tasks for a specific contest
 * GET /api/contests/:id/tasks
 */
export const getContestTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get all tasks for this contest
    const contestTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.contestId, contestId))
      .orderBy(tasks.orderIndex);

    return res.status(200).json({
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
    return next(error);
  }
};

/**
 * Get single task by ID
 * GET /api/tasks/:id
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.id as string);

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Get contest info
    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, task.contestId));

    return res.status(200).json({
      task,
      contest: contest ? {
        id: contest.id,
        title: contest.title,
        duration: contest.duration,
        status: contest.status,
      } : null,
    });
  } catch (error) {
    return next(error);
  }
};

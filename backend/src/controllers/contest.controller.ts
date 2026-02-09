import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { contests, tasks, contestParticipants, users, testCases, submissions, userTaskProgress, contestResults, contestSettings } from '../db/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
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

    const { title, description, difficulty, duration, startPassword, contestTasks, tasks: tasksFromBody, participantIds, participants, fullScreenMode, scheduledStartTime, endTime } = req.body;

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
    // Prioritize participants from body which matches frontend
    const newParticipantsRaw = participants || participantIds || req.body.participants;

    console.log('DEBUG: createContest payload:', {
      hasParticipantIds: !!participantIds,
      hasParticipants: !!participants,
      hasBodyParticipants: !!req.body.participants,
      participantIdsValue: participantIds,
      participantsValue: participants,
      bodyParticipantsValue: req.body.participants,
      merged: newParticipantsRaw
    });

    if (newParticipantsRaw && Array.isArray(newParticipantsRaw) && newParticipantsRaw.length > 0) {
      // Deduplicate
      const uniqueParticipants = [...new Set(newParticipantsRaw)];
      console.log(`Adding ${uniqueParticipants.length} participants to new contest ${contest.id}`);

      const participantValues = uniqueParticipants.map((userId: any) => ({
        contestId: contest.id,
        userId: Number(userId),
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
        completedAt: contestParticipants.completedAt,
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

      // Determine effective status for the user
      let effectiveStatus = contest.status;
      if (participantInfo?.completedAt) {
        effectiveStatus = 'completed';
      }

      // console.log(`Contest ${contest.id} status for user: ${effectiveStatus} (Original: ${contest.status}, CompletedAt: ${participantInfo?.completedAt})`);

      return {
        ...contest,
        status: effectiveStatus, // Override status for the user
        hasStarted: participantInfo?.hasStarted || false,
        startedAt: participantInfo?.startedAt,
        completedAt: participantInfo?.completedAt,
        score: participantInfo?.score || 0,
      };
    });

    return res.status(200).json({ contests: myContests });
  } catch (error) {
    return next(error);
  }
};

/**
 * Complete a contest for a participant
 * POST /api/contests/:id/complete
 * This endpoint:
 * 1. Marks the participant as completed
 * 2. Calculates detailed statistics for all tasks
 * 3. Stores comprehensive results in contest_results table
 */
export const completeContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get participant record to get start time
    const [participant] = await db
      .select()
      .from(contestParticipants)
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.userId, userId)
        )
      );

    if (!participant) {
      return res.status(404).json({ message: 'Contest participant not found' });
    }

    // Get all tasks for this contest
    const contestTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.contestId, contestId))
      .orderBy(tasks.orderIndex);

    if (contestTasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this contest' });
    }

    // Calculate detailed statistics for each task
    const taskResults = await Promise.all(
      contestTasks.map(async (task) => {
        // Get all submissions for this task by this user
        const taskSubmissions = await db
          .select()
          .from(submissions)
          .where(
            and(
              eq(submissions.taskId, task.id),
              eq(submissions.userId, userId),
              eq(submissions.contestId, contestId)
            )
          )
          .orderBy(desc(submissions.score));

        // Get user task progress for AI hints usage
        const [progress] = await db
          .select()
          .from(userTaskProgress)
          .where(
            and(
              eq(userTaskProgress.userId, userId),
              eq(userTaskProgress.taskId, task.id)
            )
          );

        // Get test cases count for this task
        const taskTestCases = await db
          .select()
          .from(testCases)
          .where(eq(testCases.taskId, task.id));

        const totalTestCases = taskTestCases.length;
        const bestSubmission = taskSubmissions[0]; // Already sorted by score DESC
        const testCasesPassed = bestSubmission?.passedTests || 0;
        const score = bestSubmission?.score || 0;
        const completed = testCasesPassed === totalTestCases && totalTestCases > 0;

        return {
          taskId: task.id,
          title: task.title,
          completed,
          submissions: taskSubmissions.length,
          aiHintsUsed: progress?.hintsUnlocked || 0,
          solutionUnlocked: progress?.solutionUnlocked || false,
          testCasesPassed,
          totalTestCases,
          score,
          maxPoints: task.maxPoints || 100,
          bestSubmissionId: bestSubmission?.id,
        };
      })
    );

    // Calculate overall statistics
    const totalTasks = contestTasks.length;
    const tasksCompleted = taskResults.filter(r => r.completed).length;
    const completionPercentage = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

    const totalScore = taskResults.reduce((sum, r) => sum + r.score, 0);
    const totalPossibleScore = taskResults.reduce((sum, r) => sum + r.maxPoints, 0);
    const percentageScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;

    const completedAt = new Date();
    const startedAt = participant.startedAt || completedAt;
    const timeTaken = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000); // in seconds

    // Save contest results
    const [contestResult] = await db
      .insert(contestResults)
      .values({
        contestId,
        userId,
        totalScore,
        totalPossibleScore,
        percentageScore,
        tasksCompleted,
        totalTasks,
        completionPercentage,
        taskResults,
        startedAt,
        completedAt,
        timeTaken,
      })
      .returning();

    // Update participant record
    const [updatedParticipant] = await db
      .update(contestParticipants)
      .set({
        completedAt,
        score: totalScore,
      })
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.userId, userId)
        )
      )
      .returning();

    console.log(`User ${userId} completed contest ${contestId}. Stats:`, {
      totalScore,
      percentageScore,
      tasksCompleted,
      totalTasks,
      completionPercentage,
    });

    return res.status(200).json({
      message: 'Contest completed successfully',
      participant: updatedParticipant,
      results: contestResult,
    });
  } catch (error) {
    console.error('Error completing contest:', error);
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
      .select({
        id: tasks.id,
        contestId: tasks.contestId,
        title: tasks.title,
        description: tasks.description,
        difficulty: tasks.difficulty,
        maxPoints: tasks.maxPoints,
        orderIndex: tasks.orderIndex,
        allowedLanguages: tasks.allowedLanguages,
        functionName: tasks.functionName,
        boilerplateCode: tasks.boilerplateCode,
        testRunnerTemplate: tasks.testRunnerTemplate,
        aiConfig: tasks.aiConfig,
      })
      .from(tasks)
      .where(eq(tasks.contestId, contestId))
      .orderBy(tasks.orderIndex);

    // Fetch test cases for all tasks
    if (contestTasks.length > 0) {
      const taskIds = contestTasks.map(t => t.id);
      const allTestCases = await db
        .select({
          id: testCases.id,
          taskId: testCases.taskId,
          input: testCases.input,
          expectedOutput: testCases.expectedOutput,
          isHidden: testCases.isHidden,
          orderIndex: testCases.orderIndex,
        })
        .from(testCases)
        .where(inArray(testCases.taskId, taskIds))
        .orderBy(testCases.orderIndex);

      // Attach test cases to tasks
      for (const task of contestTasks) {
        // @ts-ignore
        task.testCases = allTestCases.filter(tc => tc.taskId === task.id);
      }
    }

    // Get contest settings for fullscreen mode (use settings instead of contest.fullScreenMode)
    const [settings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, contestId));

    return res.status(200).json({
      contest: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        difficulty: contest.difficulty,
        duration: contest.duration,
        status: contest.status,
        fullScreenMode: settings?.fullScreenModeEnabled ?? contest.fullScreenMode ?? true, // Use settings first, fallback to contest field
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

/**
 * Get contest results for a user
 * GET /api/contests/:id/results
 * Returns detailed statistics about user's performance in the contest
 */
export const getContestResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get contest info
    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get contest results
    const [results] = await db
      .select()
      .from(contestResults)
      .where(
        and(
          eq(contestResults.contestId, contestId),
          eq(contestResults.userId, userId)
        )
      );

    if (!results) {
      return res.status(404).json({ message: 'Contest results not found. Please complete the contest first.' });
    }

    return res.status(200).json({
      success: true,
      contest: {
        id: contest.id,
        title: contest.title,
        difficulty: contest.difficulty,
        duration: contest.duration,
      },
      results,
    });
  } catch (error) {
    console.error('Error fetching contest results:', error);
    return next(error);
  }
};

/**
 * Get contest results for a specific user (Admin only)
 * GET /api/contests/:contestId/results/:userId
 */
export const getContestResultsByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.contestId as string);
    const userId = parseInt(req.params.userId as string);

    // Get contest info
    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get user info
    const [userInfo] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userInfo) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get contest results
    const [results] = await db
      .select()
      .from(contestResults)
      .where(
        and(
          eq(contestResults.contestId, contestId),
          eq(contestResults.userId, userId)
        )
      );

    if (!results) {
      return res.status(404).json({ message: 'Contest results not found for this user.' });
    }

    return res.status(200).json({
      success: true,
      contest: {
        id: contest.id,
        title: contest.title,
        difficulty: contest.difficulty,
        duration: contest.duration,
      },
      user: userInfo,
      results,
    });
  } catch (error) {
    console.error('Error fetching contest results by user:', error);
    return next(error);
  }
};

/**
 * Pause an active contest
 * POST /api/contests/:id/pause
 */
export const pauseContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.status !== 'active') {
      return res.status(400).json({ message: 'Only active contests can be paused' });
    }

    if (contest.contestState === 'paused') {
      return res.status(400).json({ message: 'Contest is already paused' });
    }

    const [updatedContest] = await db
      .update(contests)
      .set({
        contestState: 'paused',
        updatedAt: new Date(),
      })
      .where(eq(contests.id, contestId))
      .returning();

    // Emit socket event to all participants
    const io = req.app.get('io');
    if (io) {
      io.to(`contest-${contestId}`).emit('contest-paused', {
        contestId,
        message: 'Contest has been paused by the administrator'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contest paused successfully',
      contest: updatedContest,
    });
  } catch (error) {
    console.error('Error pausing contest:', error);
    return next(error);
  }
};

/**
 * Resume a paused contest
 * POST /api/contests/:id/resume
 */
export const resumeContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.contestState !== 'paused') {
      return res.status(400).json({ message: 'Contest is not paused' });
    }

    const [updatedContest] = await db
      .update(contests)
      .set({
        contestState: 'running',
        updatedAt: new Date(),
      })
      .where(eq(contests.id, contestId))
      .returning();

    // Emit socket event to all participants
    const io = req.app.get('io');
    if (io) {
      io.to(`contest-${contestId}`).emit('contest-resumed', {
        contestId,
        message: 'Contest has been resumed by the administrator'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contest resumed successfully',
      contest: updatedContest,
    });
  } catch (error) {
    console.error('Error resuming contest:', error);
    return next(error);
  }
};

/**
 * End an active contest immediately
 * POST /api/contests/:id/end
 */
export const endContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.status !== 'active') {
      return res.status(400).json({ message: 'Only active contests can be ended' });
    }

    const [updatedContest] = await db
      .update(contests)
      .set({
        contestState: 'ended',
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(contests.id, contestId))
      .returning();

    // Emit socket event to all participants
    const io = req.app.get('io');
    if (io) {
      io.to(`contest-${contestId}`).emit('contest-ended', {
        contestId,
        message: 'Contest has been ended by the administrator. Please submit your work.',
        autoSubmit: true
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contest ended successfully',
      contest: updatedContest,
    });
  } catch (error) {
    console.error('Error ending contest:', error);
    return next(error);
  }
};

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

    // Get tasks and participants in parallel
    const [contestTasks, participants] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(eq(tasks.contestId, contestId))
        .orderBy(tasks.orderIndex),
      db
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
        .where(eq(contestParticipants.contestId, contestId)),
    ]);

    // Get activity log counts for each participant
    const { activityLogs } = await import('../db/schema');
    const participantsWithLogs = await Promise.all(
      participants.map(async (participant) => {
        const logs = await db
          .select()
          .from(activityLogs)
          .where(
            and(
              eq(activityLogs.contestId, contestId),
              eq(activityLogs.userId, participant.userId)
            )
          );

        const alertCount = logs.filter(log => log.severity === 'alert').length;
        const warningCount = logs.filter(log => log.severity === 'warning').length;

        return {
          ...participant,
          alertCount,
          warningCount,
        };
      })
    );

    // Check user role - only admins see hidden test cases
    const userRole = (req as any).user?.role;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    return res.status(200).json({
      contest: {
        ...contest,
        tasks: await Promise.all(contestTasks.map(async (task) => {
          const taskTestCases = await db
            .select()
            .from(testCases)
            .where(eq(testCases.taskId, task.id));
          // Non-admin users only see visible test cases (hidden ones stripped)
          const filteredTestCases = isAdmin
            ? taskTestCases
            : taskTestCases.filter(tc => !tc.isHidden).map(({ isHidden, ...tc }) => tc);
          return { ...task, testCases: filteredTestCases };
        })),
        participants: participantsWithLogs,
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

      // Get existing tasks
      const existingTasks = await db.select().from(tasks).where(eq(tasks.contestId, contestId));
      const existingTaskMap = new Map(existingTasks.map(t => [t.id, t]));

      // Separate tasks into: update (have existing id) vs new (no id)
      const tasksWithId = tasksList.filter((t: any) => t.id && existingTaskMap.has(t.id));
      const newTasks = tasksList.filter((t: any) => !t.id || !existingTaskMap.has(t.id));
      const incomingIds = new Set(tasksWithId.map((t: any) => t.id));
      const tasksToDelete = existingTasks.filter(t => !incomingIds.has(t.id));

      // Delete removed tasks and their test cases
      if (tasksToDelete.length > 0) {
        const deleteIds = tasksToDelete.map(t => t.id);
        await db.delete(testCases).where(inArray(testCases.taskId, deleteIds));
        await db.delete(tasks).where(inArray(tasks.id, deleteIds));
        console.log(`Deleted ${deleteIds.length} removed task(s)`);
      }

      // Update existing tasks IN-PLACE (preserves task IDs → submissions stay valid)
      for (const [index, task] of tasksWithId.entries()) {
        await db.update(tasks).set({
          title: task.title,
          description: task.description,
          difficulty: task.difficulty || difficulty || 'Medium',
          maxPoints: task.maxPoints || 100,
          allowedLanguages: task.allowedLanguages || [],
          orderIndex: tasksList.indexOf(task),
          functionName: task.functionName,
          boilerplateCode: task.boilerplateCode,
          testRunnerTemplate: task.testRunnerTemplate,
          aiConfig: task.aiConfig,
        }).where(eq(tasks.id, task.id));

        // Replace test cases for this task
        await db.delete(testCases).where(eq(testCases.taskId, task.id));
        if (task.testCases && Array.isArray(task.testCases) && task.testCases.length > 0) {
          const testCaseValues = task.testCases.map((tc: any, tcIndex: number) => ({
            taskId: task.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden || false,
            orderIndex: tcIndex,
          }));
          await db.insert(testCases).values(testCaseValues);
        }
        console.log(`Updated Task ${task.id}: ${task.title}`);
      }

      // Insert genuinely new tasks
      for (const task of newTasks) {
        const orderIdx = tasksList.indexOf(task);
        const [newTask] = await db.insert(tasks).values({
          contestId: contestId,
          title: task.title,
          description: task.description,
          difficulty: task.difficulty || difficulty || 'Medium',
          maxPoints: task.maxPoints || 100,
          allowedLanguages: task.allowedLanguages || [],
          orderIndex: orderIdx,
          functionName: task.functionName,
          boilerplateCode: task.boilerplateCode,
          testRunnerTemplate: task.testRunnerTemplate,
          aiConfig: task.aiConfig,
        }).returning();

        if (task.testCases && Array.isArray(task.testCases) && task.testCases.length > 0) {
          const testCaseValues = task.testCases.map((tc: any, tcIndex: number) => ({
            taskId: newTask.id,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden || false,
            orderIndex: tcIndex,
          }));
          await db.insert(testCases).values(testCaseValues);
        }
        console.log(`Created new Task ${newTask.id}: ${task.title}`);
      }

      console.log('Tasks and test cases updated successfully (ID-preserving)');
    }

    // Update participants if provided
    // Check for both 'participants' (from frontend FormData) and 'participantIds' (consistency)
    const newParticipantsRaw = req.body.participants || req.body.participantIds;

    if (newParticipantsRaw && Array.isArray(newParticipantsRaw)) {
      // Deduplicate participants
      const newParticipantIds = [...new Set(newParticipantsRaw.map((id: any) => Number(id)))];
      console.log('Updating participants for contest:', contestId, 'Count:', newParticipantIds.length);

      // Get existing participants (preserve their progress!)
      const existingParticipants = await db
        .select()
        .from(contestParticipants)
        .where(eq(contestParticipants.contestId, contestId));
      const existingUserIds = new Set(existingParticipants.map(p => p.userId));

      // ADD new participants that don't already exist
      const toAdd = newParticipantIds.filter(id => !existingUserIds.has(id));
      if (toAdd.length > 0) {
        await db.insert(contestParticipants).values(
          toAdd.map(userId => ({ contestId, userId }))
        );
        console.log(`Added ${toAdd.length} new participant(s)`);
      }

      // REMOVE participants NOT in the new list — but only if they haven't started
      // (protect active participants from accidental removal)
      const newIdSet = new Set(newParticipantIds);
      const toRemove = existingParticipants.filter(p => !newIdSet.has(p.userId) && !p.hasStarted);
      if (toRemove.length > 0) {
        for (const p of toRemove) {
          await db.delete(contestParticipants).where(
            and(
              eq(contestParticipants.contestId, contestId),
              eq(contestParticipants.userId, p.userId)
            )
          );
        }
        console.log(`Removed ${toRemove.length} inactive participant(s)`);
      }

      const skippedRemoval = existingParticipants.filter(p => !newIdSet.has(p.userId) && p.hasStarted);
      if (skippedRemoval.length > 0) {
        console.log(`⚠️ Kept ${skippedRemoval.length} active participant(s) despite not being in new list (they have started)`);
      }

      console.log('Participants updated successfully (non-destructive)');
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

    // Delete associated tasks and participants in parallel
    await Promise.all([
      db.delete(tasks).where(eq(tasks.contestId, contestId)),
      db.delete(contestParticipants).where(eq(contestParticipants.contestId, contestId)),
    ]);

    // Delete contest (must be after dependents are gone)
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

    // Calculate detailed statistics for each task using Promise.all
    const taskResults = await Promise.all(
      contestTasks.map(async (task) => {
        // Fetch submissions, progress, and test cases in PARALLEL
        const [taskSubmissions, progressRows, taskTestCases] = await Promise.all([
          db
            .select()
            .from(submissions)
            .where(
              and(
                eq(submissions.taskId, task.id),
                eq(submissions.userId, userId),
                eq(submissions.contestId, contestId)
              )
            )
            .orderBy(desc(submissions.score)),
          db
            .select()
            .from(userTaskProgress)
            .where(
              and(
                eq(userTaskProgress.userId, userId),
                eq(userTaskProgress.taskId, task.id)
              )
            ),
          db
            .select()
            .from(testCases)
            .where(eq(testCases.taskId, task.id)),
        ]);

        const progress = progressRows[0] || null;

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

    // Build tasks with test cases
    let tasksResponse: any[] = contestTasks as any[];
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

      tasksResponse = contestTasks.map(task => ({
        ...task,
        // Only send VISIBLE test cases to participants (hide hidden ones)
        testCases: allTestCases
          .filter(tc => tc.taskId === task.id && !tc.isHidden)
          .map(({ isHidden, ...tc }) => tc), // Strip isHidden field from response
      }));
    }

    // Fetch settings and participant lookup IN PARALLEL
    const userId = req.user?.userId;
    const [settingsRow, participant] = await Promise.all([
      db
        .select()
        .from(contestSettings)
        .where(eq(contestSettings.contestId, contestId))
        .then(rows => rows[0] || null),
      userId
        ? db
            .select()
            .from(contestParticipants)
            .where(
              and(
                eq(contestParticipants.contestId, contestId),
                eq(contestParticipants.userId, userId)
              )
            )
            .then(rows => rows[0] || null)
        : Promise.resolve(null),
    ]);

    const settings = settingsRow;

    // Mark participant as started if not already (skip for already-completed participants in review mode)
    if (userId && participant && !participant.hasStarted && !participant.completedAt) {
      await db
        .update(contestParticipants)
        .set({
          hasStarted: true,
          startedAt: new Date(),
        })
        .where(
          and(
            eq(contestParticipants.contestId, contestId),
            eq(contestParticipants.userId, userId)
          )
        );
      console.log(`✅ Participant ${userId} marked as started for contest ${contestId}`);
    }

    return res.status(200).json({
      contest: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        difficulty: contest.difficulty,
        duration: contest.duration,
        status: contest.status,
        contestState: contest.contestState,
        fullScreenMode: settings?.fullScreenModeEnabled ?? contest.fullScreenMode ?? true,
      },
      tasks: tasksResponse,
      settings: {
        aiHintsEnabled: settings?.aiHintsEnabled ?? true,
        aiModeEnabled: settings?.aiModeEnabled ?? true,
        testModeEnabled: settings?.testModeEnabled ?? false,
        maxHintsAllowed: settings?.maxHintsAllowed ?? 3,
        hintUnlockAfterSubmissions: settings?.hintUnlockAfterSubmissions ?? 0,
        solutionUnlockAfterSubmissions: settings?.solutionUnlockAfterSubmissions ?? 0,
        maxSubmissionsAllowed: settings?.maxSubmissionsAllowed ?? 0,
        allowCopyPaste: settings?.allowCopyPaste ?? false,
      },
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
    console.log(`🔴 PAUSE CONTEST: Received request for contest ${contestId}`);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      console.error(`Contest ${contestId} not found`);
      return res.status(404).json({ message: 'Contest not found' });
    }

    console.log(`Contest found: status=${contest.status}, contestState=${contest.contestState}`);

    if (contest.status !== 'active') {
      console.error(`Contest ${contestId} status is ${contest.status}, not active`);
      return res.status(400).json({ message: 'Only active contests can be paused' });
    }

    if (contest.contestState === 'paused') {
      console.error(`Contest ${contestId} is already paused`);
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

    console.log(`✅ Contest ${contestId} updated to paused state`);

    // Emit socket event to all participants
    const io = req.app.get('io');
    console.log(`🔌 Socket.io instance: ${io ? 'EXISTS' : 'MISSING'}`);
    
    if (io) {
      console.log(`📢 Broadcasting 'contest-paused' to room: contest-${contestId}`);
      const roomSockets = io.sockets.adapter.rooms.get(`contest-${contestId}`);
      console.log(`📊 Participants in room: ${roomSockets ? roomSockets.size : 0}`);
      
      io.to(`contest-${contestId}`).emit('contest-paused', {
        contestId,
        message: 'Contest has been paused by the administrator'
      });
      
      console.log(`✅ Event emitted to contest-${contestId}`);
    } else {
      console.error('❌ Socket.io instance not found!');
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

/**
 * Reset an entire contest
 * POST /api/contests/:id/reset
 * Clears all submissions, progress, results, and resets participant state
 */
export const resetContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get all task IDs for this contest
    const contestTasks = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.contestId, contestId));
    const taskIds = contestTasks.map(t => t.id);

    // Delete submissions, task progress, and results in parallel
    await Promise.all([
      db.delete(submissions).where(eq(submissions.contestId, contestId)),
      taskIds.length > 0
        ? db.delete(userTaskProgress).where(inArray(userTaskProgress.taskId, taskIds))
        : Promise.resolve(),
      db.delete(contestResults).where(eq(contestResults.contestId, contestId)),
    ]);

    // Reset all participant records and contest state in parallel
    const [, updatedContest] = await Promise.all([
      db
        .update(contestParticipants)
        .set({
          hasStarted: false,
          startedAt: null,
          score: 0,
          rank: null,
          completedAt: null,
        })
        .where(eq(contestParticipants.contestId, contestId)),
      db
        .update(contests)
        .set({
          status: 'upcoming',
          contestState: 'running',
          isStarted: false,
          startedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(contests.id, contestId))
        .returning()
        .then(rows => rows[0]),
    ]);

    // Notify all connected participants
    const io = req.app.get('io');
    if (io) {
      io.to(`contest-${contestId}`).emit('contest-reset', {
        contestId,
        message: 'Contest has been reset by the administrator. You will be redirected.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contest reset successfully. All submissions, progress, and results have been cleared.',
      contest: updatedContest,
    });
  } catch (error) {
    console.error('Error resetting contest:', error);
    return next(error);
  }
};

/**
 * Pause contest for a specific user
 * POST /api/contests/:id/user/:userId/pause
 */
export const pauseUserContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.userId as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.status !== 'active') {
      return res.status(400).json({ message: 'Contest is not active' });
    }

    // Verify participant exists
    const [participant] = await db
      .select()
      .from(contestParticipants)
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, targetUserId)));

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found in this contest' });
    }

    // Emit pause event targeted to this specific user
    const io = req.app.get('io');
    if (io) {
      io.to(`contest-${contestId}`).emit('user-contest-paused', {
        contestId,
        userId: targetUserId,
        message: 'Your contest has been paused by the administrator.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Contest paused for user ${targetUserId}`,
    });
  } catch (error) {
    console.error('Error pausing user contest:', error);
    return next(error);
  }
};

/**
 * Resume contest for a specific user
 * POST /api/contests/:id/user/:userId/resume
 */
export const resumeUserContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.userId as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Emit resume event targeted to this specific user
    const io = req.app.get('io');
    if (io) {
      io.to(`contest-${contestId}`).emit('user-contest-resumed', {
        contestId,
        userId: targetUserId,
        message: 'Your contest has been resumed by the administrator.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Contest resumed for user ${targetUserId}`,
    });
  } catch (error) {
    console.error('Error resuming user contest:', error);
    return next(error);
  }
};

/**
 * Reset contest for a specific user
 * POST /api/contests/:id/user/:userId/reset
 * Clears that user's submissions, progress, and results for this contest
 */
export const resetUserContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.userId as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Verify participant exists
    const [participant] = await db
      .select()
      .from(contestParticipants)
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, targetUserId)));

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found in this contest' });
    }

    // Get all task IDs for this contest
    const contestTasks = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.contestId, contestId));
    const taskIds = contestTasks.map(t => t.id);

    // Delete user's submissions, progress, and results in parallel
    await Promise.all([
      db.delete(submissions).where(
        and(eq(submissions.contestId, contestId), eq(submissions.userId, targetUserId))
      ),
      taskIds.length > 0
        ? db.delete(userTaskProgress).where(
            and(inArray(userTaskProgress.taskId, taskIds), eq(userTaskProgress.userId, targetUserId))
          )
        : Promise.resolve(),
      db.delete(contestResults).where(
        and(eq(contestResults.contestId, contestId), eq(contestResults.userId, targetUserId))
      ),
    ]);

    // Reset participant record
    await db
      .update(contestParticipants)
      .set({
        hasStarted: false,
        startedAt: null,
        score: 0,
        rank: null,
        completedAt: null,
      })
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, targetUserId)));

    // Notify the specific user
    const io = req.app.get('io');
    if (io) {
      io.to(`contest-${contestId}`).emit('user-contest-reset', {
        contestId,
        userId: targetUserId,
        message: 'Your contest progress has been reset by the administrator. You will be redirected.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Contest reset for user ${targetUserId}. All submissions, progress, and results cleared.`,
    });
  } catch (error) {
    console.error('Error resetting user contest:', error);
    return next(error);
  }
};

/**
 * End contest for a specific user
 * POST /api/contests/:id/user/:userId/end
 * Auto-submits their current work and redirects them to results
 */
export const endUserContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contestId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.userId as string);

    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId));

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.status !== 'active') {
      return res.status(400).json({ message: 'Contest is not active' });
    }

    // Verify participant exists
    const [participant] = await db
      .select()
      .from(contestParticipants)
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, targetUserId)));

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found in this contest' });
    }

    // Mark participant as completed
    await db
      .update(contestParticipants)
      .set({
        completedAt: new Date(),
      })
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, targetUserId)));

    // Emit end event targeted to this specific user — triggers auto-submit + redirect on client
    const io = req.app.get('io');
    if (io) {
      io.to(`contest-${contestId}`).emit('user-contest-ended', {
        contestId,
        userId: targetUserId,
        message: 'Your contest has been ended by the administrator. Your work is being submitted.',
        autoSubmit: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Contest ended for user ${targetUserId}. Auto-submit triggered.`,
    });
  } catch (error) {
    console.error('Error ending user contest:', error);
    return next(error);
  }
};

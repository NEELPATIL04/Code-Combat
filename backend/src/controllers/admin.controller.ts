import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { submissions, contestParticipants, aiUsageLogs, users, contests } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Get all submissions for a participant in a contest
 * GET /api/admin/participants/:userId/contest/:contestId/submissions
 */
export const getParticipantSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, contestId } = req.params;

        const userSubmissions = await db
            .select()
            .from(submissions)
            .where(
                and(
                    eq(submissions.userId, parseInt(String(userId))),
                    eq(submissions.contestId, parseInt(String(contestId)))
                )
            )
            .orderBy(desc(submissions.submittedAt));

        return res.json({
            success: true,
            data: {
                submissions: userSubmissions,
            },
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Update submission score
 * PATCH /api/admin/submissions/:id/score
 */
export const updateSubmissionScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { score } = req.body;

        if (score === undefined || score < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid score is required',
            });
        }

        // Update submission score
        const [updatedSubmission] = await db
            .update(submissions)
            .set({ score })
            .where(eq(submissions.id, parseInt(String(id))))
            .returning();

        if (!updatedSubmission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found',
            });
        }

        // Recalculate and update participant's total score in the contest
        // This logic assumes we take the BEST score per task.
        // 1. Get all submissions for this user in this contest
        const allSubmissions = await db
            .select({
                taskId: submissions.taskId,
                score: submissions.score,
            })
            .from(submissions)
            .where(
                and(
                    eq(submissions.userId, updatedSubmission.userId),
                    eq(submissions.contestId, updatedSubmission.contestId)
                )
            );

        // 2. Calculate total score (max score per task)
        const bestScores = new Map<number, number>();
        allSubmissions.forEach(sub => {
            const currentBest = bestScores.get(sub.taskId) || 0;
            if ((sub.score || 0) > currentBest) {
                bestScores.set(sub.taskId, sub.score || 0);
            }
        });

        let totalScore = 0;
        bestScores.forEach(s => totalScore += s);

        // 3. Update contest_participants
        await db
            .update(contestParticipants)
            .set({ score: totalScore })
            .where(
                and(
                    eq(contestParticipants.userId, updatedSubmission.userId),
                    eq(contestParticipants.contestId, updatedSubmission.contestId)
                )
            );

        return res.json({
            success: true,
            data: {
                submission: updatedSubmission,
                newTotalScore: totalScore
            },
        });
    } catch (error) {
        return next(error);
    }
};

/**
 * Get AI Usage Statistics
 * GET /api/admin/ai/stats
 */
export const getAiUsageStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const logs = await db.select().from(aiUsageLogs as any); // Type assertion if needed implicitly, but direct import preferred

        const stats = {
            totalRequests: logs.length,
            totalTokens: logs.reduce((acc, log) => acc + (log.tokensUsed || 0), 0),
            byProvider: {
                groq: logs.filter(l => l.provider === 'groq').length,
                gemini: logs.filter(l => l.provider === 'gemini').length,
            },
            byPurpose: {
                hint: logs.filter(l => l.purpose === 'hint').length,
                solution: logs.filter(l => l.purpose === 'solution').length,
                evaluation: logs.filter(l => l.purpose === 'evaluation').length,
                generate_task: logs.filter(l => l.purpose === 'generate_task').length,
            },
            recentErrors: 0
        };
        return res.json(stats);

    } catch (error) {
        return next(error);
    }
};

/**
 * Get AI Usage Logs (Paginated)
 * GET /api/admin/ai/logs
 */
export const getAiUsageLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(String(req.query.page)) || 1;
        const limit = parseInt(String(req.query.limit)) || 50;
        const offset = (page - 1) * limit;

        import('../db/schema').then(async ({ aiUsageLogs, users }) => {
            const logs = await db
                .select({
                    id: aiUsageLogs.id,
                    provider: aiUsageLogs.provider,
                    model: aiUsageLogs.model,
                    purpose: aiUsageLogs.purpose,
                    tokensUsed: aiUsageLogs.tokensUsed,
                    timestamp: aiUsageLogs.timestamp,
                    username: users.username,
                    contestId: aiUsageLogs.contestId,
                })
                .from(aiUsageLogs)
                .leftJoin(users, eq(aiUsageLogs.userId, users.id))
                .orderBy(desc(aiUsageLogs.timestamp))
                .limit(limit)
                .offset(offset);

            return res.json({ logs, page, limit });
        });

    } catch (error) {
        return next(error);
    }
};
/**
 * Get Dashboard Stats
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        import('../db/schema').then(async ({ users, contests, submissions, contestParticipants }) => {
            // Parallelize independent queries for performance
            const [
                usersCount,
                contestsCount,
                submissionsCount,
                acceptedSubmissionsCount,
                recentContestsData,
                recentUsersData
            ] = await Promise.all([
                // 1. Total Active Users
                db.select({ count: users.id }).from(users).then(res => res.length),

                // 2. Total Contests
                db.select({ count: contests.id }).from(contests).then(res => res.length),

                // 3. Total Submissions
                db.select({ count: submissions.id }).from(submissions).then(res => res.length),

                // 4. Accepted Submissions (for success rate)
                db.select({ count: submissions.id })
                    .from(submissions)
                    .where(eq(submissions.status, 'accepted'))
                    .then(res => res.length),

                // 5. Recent Contests
                db.select({
                    id: contests.id,
                    title: contests.title,
                    status: contests.status,
                    createdAt: contests.createdAt
                })
                    .from(contests)
                    .orderBy(desc(contests.createdAt))
                    .limit(5),

                // 6. Recent Users
                db.select({
                    id: users.id,
                    username: users.username,
                    email: users.email,
                    role: users.role,
                    createdAt: users.createdAt
                })
                    .from(users)
                    .orderBy(desc(users.createdAt))
                    .limit(5)
            ]);

            // Calculate participant counts for the recent contests
            const contestsWithParticipants = await Promise.all(
                recentContestsData.map(async (contest) => {
                    const participantCount = await db
                        .select({ count: contestParticipants.id })
                        .from(contestParticipants)
                        .where(eq(contestParticipants.contestId, contest.id))
                        .then(res => res.length);

                    return {
                        ...contest,
                        participants: participantCount
                    };
                })
            );

            const successRate = submissionsCount > 0
                ? Math.round((acceptedSubmissionsCount / submissionsCount) * 100)
                : 0;

            return res.json({
                success: true,
                data: {
                    stats: {
                        activeUsers: usersCount,
                        totalContests: contestsCount,
                        totalSubmissions: submissionsCount,
                        successRate: successRate
                    },
                    recentContests: contestsWithParticipants,
                    recentUsers: recentUsersData
                }
            });
        });

    } catch (error) {
        return next(error);
    }
};

/**
 * Get Participant Profile
 * GET /api/admin/participants/:id
 */
export const getParticipantProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = parseInt(String(id));

        import('../db/schema').then(async ({ users, contests, submissions, contestParticipants }) => {
            // 1. Get User Details
            const [user] = await db
                .select({
                    id: users.id,
                    username: users.username,
                    email: users.email,
                    joinedAt: users.createdAt,
                    role: users.role
                })
                .from(users)
                .where(eq(users.id, userId));

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // 2. Get Overall Stats
            const [
                totalSubmissions,
                acceptedSubmissions,
                totalContests
            ] = await Promise.all([
                db.select({ count: submissions.id })
                    .from(submissions)
                    .where(eq(submissions.userId, userId))
                    .then(res => res.length),

                db.select({ count: submissions.id })
                    .from(submissions)
                    .where(and(eq(submissions.userId, userId), eq(submissions.status, 'accepted')))
                    .then(res => res.length),

                db.select({ count: contestParticipants.id })
                    .from(contestParticipants)
                    .where(eq(contestParticipants.userId, userId))
                    .then(res => res.length)
            ]);

            const successRate = totalSubmissions > 0
                ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
                : 0;

            // 3. Get Contest History
            const contestHistory = await db
                .select({
                    id: contests.id,
                    title: contests.title,
                    status: contests.status,
                    score: contestParticipants.score,
                    date: contestParticipants.startedAt || contests.createdAt
                })
                .from(contestParticipants)
                .innerJoin(contests, eq(contestParticipants.contestId, contests.id))
                .where(eq(contestParticipants.userId, userId))
                .orderBy(desc(contestParticipants.startedAt));

            // 4. Get submission counts per contest
            const contestsWithStats = await Promise.all(
                contestHistory.map(async (contest) => {
                    const subCount = await db
                        .select({ count: submissions.id })
                        .from(submissions)
                        .where(and(
                            eq(submissions.userId, userId),
                            eq(submissions.contestId, contest.id)
                        ))
                        .then(res => res.length);

                    let dateStr = 'N/A';
                    try {
                        if (contest.date) {
                            const d = new Date(contest.date);
                            if (!isNaN(d.getTime())) {
                                dateStr = d.toISOString().split('T')[0];
                            }
                        }
                    } catch (e) { }

                    return {
                        ...contest,
                        submissionsCount: subCount,
                        date: dateStr
                    };
                })
            );

            // Safe date formatting helper
            const formatDate = (date: any) => {
                if (!date) return 'N/A';
                try {
                    const d = new Date(date);
                    if (isNaN(d.getTime())) return 'N/A';
                    return d.toISOString().split('T')[0];
                } catch (e) {
                    return 'N/A';
                }
            };

            return res.json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    joinedAt: formatDate(user.joinedAt),
                    totalContests,
                    totalSubmissions,
                    successRate,
                    contests: contestsWithStats
                }
            });
        });

    } catch (error) {
        return next(error);
    }
};

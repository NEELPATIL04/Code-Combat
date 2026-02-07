import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { submissions, contestParticipants } from '../db/schema';
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
                    eq(submissions.userId, parseInt(userId)),
                    eq(submissions.contestId, parseInt(contestId))
                )
            )
            .orderBy(desc(submissions.submittedAt));

        res.json({
            success: true,
            data: {
                submissions: userSubmissions,
            },
        });
    } catch (error) {
        next(error);
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
            .where(eq(submissions.id, parseInt(id)))
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

        res.json({
            success: true,
            data: {
                submission: updatedSubmission,
                newTotalScore: totalScore
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get AI Usage Statistics
 * GET /api/admin/ai/stats
 */
export const getAiUsageStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        import('../db/schema').then(async ({ aiUsageLogs }) => {
            const logs = await db.select().from(aiUsageLogs);

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
            res.json(stats);
        });

    } catch (error) {
        next(error);
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

            res.json({ logs, page, limit });
        });

    } catch (error) {
        next(error);
    }
};

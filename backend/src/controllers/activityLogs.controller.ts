import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { activityLogs, users, contestSettings } from '../db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

/**
 * Activity Logs Controller
 * Manages real-time user activity tracking during contests
 */

/**
 * Log user activity
 * POST /api/contests/:id/activity
 */
export const logActivity = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const contestId = parseInt(req.params.id as string);
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { activityType, activityData, severity } = req.body;

    if (!activityType) {
      return res.status(400).json({ message: 'Activity type is required' });
    }

    // Skip logging for admin/super_admin users - only track player activity
    const userRole = (req as any).user?.role;
    if (userRole === 'admin' || userRole === 'super_admin') {
      return res.status(200).json({
        success: true,
        message: 'Activity logging skipped for admin users',
      });
    }

    // Check if activity logging is enabled for this contest
    const [settings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, contestId))
      .limit(1);

    // Only log if activity logging is enabled (or if no settings exist, default to logging)
    if (settings && settings.enableActivityLogs === false) {
      // Still allow critical activity types even when logging is disabled
      const criticalTypes = ['task_submitted', 'contest_joined', 'contest_completed', 'screen_shift', 'copy_attempt'];
      if (!criticalTypes.includes(activityType)) {
        return res.status(200).json({
          success: true,
          message: 'Activity logging is disabled for this contest',
        });
      }
    }

    // Insert activity log
    const [log] = await db
      .insert(activityLogs)
      .values({
        contestId,
        userId,
        activityType,
        activityData: activityData || null,
        severity: severity || 'normal',
      })
      .returning();

    return res.status(201).json({
      success: true,
      log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all activity logs for a contest
 * GET /api/contests/:id/activity
 */
export const getContestActivityLogs = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const contestId = parseInt(req.params.id as string);
    const { userId, activityType, severity, limit = 100 } = req.query;

    // Build query conditions
    const conditions = [eq(activityLogs.contestId, contestId)];

    if (userId) {
      conditions.push(eq(activityLogs.userId, parseInt(userId as string)));
    }

    if (activityType) {
      conditions.push(eq(activityLogs.activityType, activityType as string));
    }

    if (severity) {
      conditions.push(eq(activityLogs.severity, severity as any));
    }

    // Fetch logs with user information
    const logs = await db
      .select({
        id: activityLogs.id,
        contestId: activityLogs.contestId,
        userId: activityLogs.userId,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        activityType: activityLogs.activityType,
        activityData: activityLogs.activityData,
        severity: activityLogs.severity,
        timestamp: activityLogs.timestamp,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(activityLogs.timestamp))
      .limit(parseInt(limit as string));

    // Check if auto-delete is enabled for this contest
    const [settings] = await db
      .select({ deleteActivityLogsAfterFetch: contestSettings.deleteActivityLogsAfterFetch })
      .from(contestSettings)
      .where(eq(contestSettings.contestId, contestId))
      .limit(1);

    // Delete logs after fetch if setting is enabled
    if (settings && settings.deleteActivityLogsAfterFetch === true && logs.length > 0) {
      const logIds = logs.map(log => log.id);

      // Delete the fetched logs using IN array
      await db
        .delete(activityLogs)
        .where(inArray(activityLogs.id, logIds));

      console.log(`✅ Auto-deleted ${logs.length} activity logs for contest ${contestId} after fetch`);
    }

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity logs for a specific user in a contest
 * GET /api/contests/:id/activity/user/:userId
 */
export const getUserActivityLogs = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const contestId = parseInt(req.params.id as string);
    const userId = parseInt(req.params.userId as string);

    const logs = await db
      .select()
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.contestId, contestId),
          eq(activityLogs.userId, userId)
        )
      )
      .orderBy(desc(activityLogs.timestamp));

    // Calculate severity counts
    const severityCounts = { alert: 0, warning: 0, normal: 0 };
    logs.forEach(log => {
      if (log.severity === 'alert') severityCounts.alert++;
      else if (log.severity === 'warning') severityCounts.warning++;
      else severityCounts.normal++;
    });

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
      severityCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity statistics for a contest
 * GET /api/contests/:id/activity/stats
 */
export const getActivityStats = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const contestId = parseInt(req.params.id as string);

    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.contestId, contestId));

    // Calculate statistics
    const stats = {
      totalActivities: logs.length,
      byType: {} as Record<string, number>,
      bySeverity: {
        normal: 0,
        warning: 0,
        alert: 0,
      },
      activeUsers: new Set(logs.map(log => log.userId)).size,
    };

    logs.forEach(log => {
      // Count by type
      stats.byType[log.activityType] = (stats.byType[log.activityType] || 0) + 1;

      // Count by severity
      if (log.severity === 'normal') stats.bySeverity.normal++;
      else if (log.severity === 'warning') stats.bySeverity.warning++;
      else if (log.severity === 'alert') stats.bySeverity.alert++;
    });

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear activity logs for a contest (admin only)
 * DELETE /api/contests/:id/activity
 */
export const clearActivityLogs = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const contestId = parseInt(req.params.id as string);

    await db
      .delete(activityLogs)
      .where(eq(activityLogs.contestId, contestId));

    return res.status(200).json({
      success: true,
      message: 'Activity logs cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

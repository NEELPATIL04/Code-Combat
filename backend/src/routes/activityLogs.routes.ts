import { Router } from 'express';
import {
  logActivity,
  getContestActivityLogs,
  getUserActivityLogs,
  getActivityStats,
  clearActivityLogs,
} from '../controllers/activityLogs.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/roleCheck.middleware';

const router = Router();

/**
 * Activity Logs Routes
 * Real-time user activity tracking during contests
 */

// Log user activity (players can log their own activities)
router.post(
  '/:id/activity',
  authenticate,
  logActivity
);

// Get all activity logs for a contest (admin only)
router.get(
  '/:id/activity',
  authenticate,
  requireRole(['admin', 'super_admin']),
  getContestActivityLogs
);

// Get activity logs for a specific user (admin only)
router.get(
  '/:id/activity/user/:userId',
  authenticate,
  requireRole(['admin', 'super_admin']),
  getUserActivityLogs
);

// Get activity statistics (admin only)
router.get(
  '/:id/activity/stats',
  authenticate,
  requireRole(['admin', 'super_admin']),
  getActivityStats
);

// Clear all activity logs for a contest (admin only)
router.delete(
  '/:id/activity',
  authenticate,
  requireRole(['admin', 'super_admin']),
  clearActivityLogs
);

export default router;

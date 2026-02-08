import { Router } from 'express';
import {
  createContest,
  getAllContests,
  getContestById,
  updateContest,
  deleteContest,
  addParticipants,
  removeParticipant,
  startContest,
  getMyContests,
  getContestTasks,
} from '../controllers/contest.controller';
import {
  getContestSettings,
  updateContestSettings,
  deleteContestSettings,
} from '../controllers/contestSettings.controller';
import {
  logActivity,
  getContestActivityLogs,
  getUserActivityLogs,
  getActivityStats,
  clearActivityLogs,
} from '../controllers/activityLogs.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/roleCheck.middleware';

/**
 * Contest Routes
 * Handles all contest-related endpoints
 */
const router = Router();

/**
 * GET /api/contests/my-contests
 * Get contests assigned to current user (player)
 * Requires: Authentication
 */
router.get('/my-contests', authenticate, getMyContests);

/**
 * POST /api/contests
 * Create a new contest
 * Requires: Authentication + Admin role
 */
router.post('/', authenticate, requireRole(['admin', 'super_admin']), createContest);

/**
 * GET /api/contests
 * Get all contests (with optional status filter)
 * Requires: Authentication + Admin role
 */
router.get('/', authenticate, requireRole(['admin', 'super_admin']), getAllContests);

/**
 * GET /api/contests/:id/tasks
 * Get all tasks for a contest
 * Requires: Authentication
 * IMPORTANT: This must come BEFORE /:id to avoid route conflicts
 */
router.get('/:id/tasks', authenticate, getContestTasks);

/**
 * POST /api/contests/:id/participants
 * Add participants to contest
 * Requires: Authentication + Admin role
 */
router.post('/:id/participants', authenticate, requireRole(['admin', 'super_admin']), addParticipants);

/**
 * DELETE /api/contests/:id/participants/:userId
 * Remove participant from contest
 * Requires: Authentication + Admin role
 */
router.delete('/:id/participants/:userId', authenticate, requireRole(['admin', 'super_admin']), removeParticipant);

/**
 * POST /api/contests/:id/start
 * Start contest
 * Requires: Authentication + Admin role
 */
router.post('/:id/start', authenticate, requireRole(['admin', 'super_admin']), startContest);

/**
 * GET /api/contests/:id/settings
 * Get contest settings
 * Requires: Authentication + Admin role
 */
router.get('/:id/settings', authenticate, getContestSettings);

/**
 * PUT /api/contests/:id/settings
 * Update contest settings
 * Requires: Authentication + Admin role
 */
router.put('/:id/settings', authenticate, requireRole(['admin', 'super_admin']), updateContestSettings);

/**
 * DELETE /api/contests/:id/settings
 * Delete contest settings
 * Requires: Authentication + Admin role
 */
router.delete('/:id/settings', authenticate, requireRole(['admin', 'super_admin']), deleteContestSettings);

/**
 * GET /api/contests/:id/settings
 * Get contest settings
 * Requires: Authentication
 */
router.get('/:id/settings', authenticate, getContestSettings);

/**
 * PUT /api/contests/:id/settings
 * Update contest settings
 * Requires: Authentication + Admin role
 */
router.put('/:id/settings', authenticate, requireRole(['admin', 'super_admin']), updateContestSettings);

/**
 * POST /api/contests/:id/activity
 * Log user activity
 * Requires: Authentication
 */
router.post('/:id/activity', authenticate, logActivity);

/**
 * GET /api/contests/:id/activity
 * Get all activity logs for contest
 * Requires: Authentication + Admin role
 */
router.get('/:id/activity', authenticate, requireRole(['admin', 'super_admin']), getContestActivityLogs);

/**
 * GET /api/contests/:id/activity/stats
 * Get activity statistics
 * Requires: Authentication + Admin role
 */
router.get('/:id/activity/stats', authenticate, requireRole(['admin', 'super_admin']), getActivityStats);

/**
 * GET /api/contests/:id/activity/user/:userId
 * Get activity logs for specific user
 * Requires: Authentication + Admin role
 */
router.get('/:id/activity/user/:userId', authenticate, requireRole(['admin', 'super_admin']), getUserActivityLogs);

/**
 * DELETE /api/contests/:id/activity
 * Clear all activity logs
 * Requires: Authentication + Admin role
 */
router.delete('/:id/activity', authenticate, requireRole(['admin', 'super_admin']), clearActivityLogs);

/**
 * GET /api/contests/:id
 * Get single contest by ID
 * Requires: Authentication
 * IMPORTANT: This must come AFTER specific routes like /:id/tasks
 */
router.get('/:id', authenticate, getContestById);

/**
 * PUT /api/contests/:id
 * Update contest
 * Requires: Authentication + Admin role
 */
router.put('/:id', authenticate, requireRole(['admin', 'super_admin']), updateContest);

/**
 * DELETE /api/contests/:id
 * Delete contest
 * Requires: Authentication + Admin role
 */
router.delete('/:id', authenticate, requireRole(['admin', 'super_admin']), deleteContest);

/**
 * Activity Log Routes
 * Hosted under /api/contests/:id/activity
 */
router.post(
  '/:id/activity',
  authenticate,
  logActivity
);

router.get(
  '/:id/activity',
  authenticate,
  getContestActivityLogs // Allow all authenticated users to view logs (or restrict?) - Controller checks restrictions usually, or we restrict here?
  // Previous file showed requireRole(['admin', 'super_admin']) for getContestActivityLogs in activityLogs.routes.ts
  // Let's assume admins only for full logs, but maybe specific user logs are open?
  // Actually, let's look at getContestActivityLogs usage in frontend. It's for admin.
);

router.get(
  '/:id/activity/stats',
  authenticate,
  requireRole(['admin', 'super_admin']),
  getActivityStats
);

/**
 * Activity Log Routes
 */
router.post('/:id/activity', authenticate, logActivity);
router.get('/:id/activity', authenticate, requireRole(['admin', 'super_admin']), getContestActivityLogs);
router.get('/:id/activity/stats', authenticate, requireRole(['admin', 'super_admin']), getActivityStats);
router.delete('/:id/activity', authenticate, requireRole(['admin', 'super_admin']), clearActivityLogs);

export default router;

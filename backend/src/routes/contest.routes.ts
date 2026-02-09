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
  completeContest,
  getContestResults,
  getContestResultsByUser,
  pauseContest,
  resumeContest,
  endContest,
  resetContest,
  pauseUserContest,
  resumeUserContest,
  resetUserContest,
  endUserContest,
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
 * POST /api/contests/:id/pause
 * Pause an active contest
 * Requires: Authentication + Admin role
 */
router.post('/:id/pause', authenticate, requireRole(['admin', 'super_admin']), pauseContest);

/**
 * POST /api/contests/:id/resume
 * Resume a paused contest
 * Requires: Authentication + Admin role
 */
router.post('/:id/resume', authenticate, requireRole(['admin', 'super_admin']), resumeContest);

/**
 * POST /api/contests/:id/end
 * End an active contest immediately
 * Requires: Authentication + Admin role
 */
router.post('/:id/end', authenticate, requireRole(['admin', 'super_admin']), endContest);

/**
 * POST /api/contests/:id/reset
 * Reset an entire contest (clear all progress)
 * Requires: Authentication + Admin role
 */
router.post('/:id/reset', authenticate, requireRole(['admin', 'super_admin']), resetContest);

/**
 * Per-user contest actions
 * Requires: Authentication + Admin role
 */
router.post('/:id/user/:userId/pause', authenticate, requireRole(['admin', 'super_admin']), pauseUserContest);
router.post('/:id/user/:userId/resume', authenticate, requireRole(['admin', 'super_admin']), resumeUserContest);
router.post('/:id/user/:userId/reset', authenticate, requireRole(['admin', 'super_admin']), resetUserContest);
router.post('/:id/user/:userId/end', authenticate, requireRole(['admin', 'super_admin']), endUserContest);

/**
 * POST /api/contests/:id/complete
 * Mark contest as completed for user
 * Requires: Authentication
 */
router.post('/:id/complete', authenticate, completeContest);

/**
 * GET /api/contests/:id/results
 * Get contest results for current user
 * Requires: Authentication
 */
router.get('/:id/results', authenticate, getContestResults);

/**
 * GET /api/contests/:contestId/results/:userId
 * Get contest results for a specific user (Admin only)
 * Requires: Authentication + Admin role
 */
router.get('/:contestId/results/:userId', authenticate, requireRole(['admin', 'super_admin']), getContestResultsByUser);

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
 * Contest Settings Routes
 */
router.get('/:id/settings', authenticate, getContestSettings);
router.put('/:id/settings', authenticate, requireRole(['admin', 'super_admin']), updateContestSettings);
router.delete('/:id/settings', authenticate, requireRole(['admin', 'super_admin']), deleteContestSettings);

/**
 * Activity Log Routes
 */
router.post('/:id/activity', authenticate, logActivity);
router.get('/:id/activity/stats', authenticate, requireRole(['admin', 'super_admin']), getActivityStats);
router.get('/:id/activity/user/:userId', authenticate, requireRole(['admin', 'super_admin']), getUserActivityLogs);
router.get('/:id/activity', authenticate, requireRole(['admin', 'super_admin']), getContestActivityLogs);
router.delete('/:id/activity', authenticate, requireRole(['admin', 'super_admin']), clearActivityLogs);

/**
 * Base Contest Routes (must come LAST to avoid conflicts)
 */
router.get('/:id', authenticate, getContestById);
router.put('/:id', authenticate, requireRole(['admin', 'super_admin']), updateContest);
router.delete('/:id', authenticate, requireRole(['admin', 'super_admin']), deleteContest);

export default router;

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

export default router;

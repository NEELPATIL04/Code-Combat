import { Router } from 'express';
import {
  getAllProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  submitProblemSolution,
  getProblemSubmissions,
  getUserStats,
} from '../controllers/problem.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/roleCheck.middleware';

/**
 * Problem Routes
 * Standalone coding problems (LeetCode-style)
 */
const router = Router();

/**
 * GET /api/problems/stats
 * Get user's problem-solving statistics
 * Requires: Authentication
 */
router.get('/stats', authenticate, getUserStats);

/**
 * GET /api/problems
 * Get all problems (with optional filters)
 * Public route (shows more details if authenticated)
 */
router.get('/', getAllProblems);

/**
 * GET /api/problems/:identifier
 * Get single problem by ID or slug
 * Public route (shows progress if authenticated)
 */
router.get('/:identifier', getProblemById);

/**
 * POST /api/problems
 * Create new problem
 * Requires: Authentication + Admin role
 */
router.post('/', authenticate, requireRole(['admin', 'super_admin']), createProblem);

/**
 * PUT /api/problems/:id
 * Update problem
 * Requires: Authentication + Admin role
 */
router.put('/:id', authenticate, requireRole(['admin', 'super_admin']), updateProblem);

/**
 * DELETE /api/problems/:id
 * Delete problem
 * Requires: Authentication + Admin role
 */
router.delete('/:id', authenticate, requireRole(['admin', 'super_admin']), deleteProblem);

/**
 * POST /api/problems/:id/submit
 * Submit solution to problem
 * Requires: Authentication
 */
router.post('/:id/submit', authenticate, submitProblemSolution);

/**
 * GET /api/problems/:id/submissions
 * Get user's submissions for a problem
 * Requires: Authentication
 */
router.get('/:id/submissions', authenticate, getProblemSubmissions);

export default router;

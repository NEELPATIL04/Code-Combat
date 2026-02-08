import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/roleCheck.middleware';
import { runCode, submitCode, getTaskSubmissions, resetUserTaskSubmissions, healthCheck } from '../controllers/submission.controller';

const router = Router();

// Run code against test cases (no save) - requires auth
router.post('/run', authenticate, runCode);

// Submit code solution (saves to DB) - requires auth
router.post('/submit', authenticate, submitCode);

// Get submission history for a task - requires auth
router.get('/task/:taskId', authenticate, getTaskSubmissions);

// Reset user submissions for a task - requires auth + admin role
router.delete('/task/:taskId/user/:userId/reset', authenticate, requireRole(['admin', 'super_admin']), resetUserTaskSubmissions);

// Health check - no auth required
router.get('/health', healthCheck);

export default router;

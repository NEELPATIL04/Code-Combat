import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { runCode, submitCode, getTaskSubmissions, healthCheck } from '../controllers/submission.controller';

const router = Router();

// Run code against test cases (no save) - requires auth
router.post('/run', authenticate, runCode);

// Submit code solution (saves to DB) - requires auth
router.post('/submit', authenticate, submitCode);

// Get submission history for a task - requires auth
router.get('/task/:taskId', authenticate, getTaskSubmissions);

// Health check - no auth required
router.get('/health', healthCheck);

export default router;

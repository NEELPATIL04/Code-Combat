import { Router } from 'express';
import { generateTestCases, validateTestCase } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// Generate test cases using AI
router.post('/generate-test-cases', generateTestCases);

// Validate a test case
router.post('/validate-test-case', validateTestCase);

export default router;

import { Router } from 'express';
import { getHint, getSolution, evaluateCode, generateCode, generateTestCases } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/hint', authenticate, getHint);
router.post('/solution', authenticate, getSolution);
router.post('/evaluate', authenticate, evaluateCode);
router.post('/generate-code', authenticate, generateCode);
router.post('/generate-test-cases', authenticate, generateTestCases);

export default router;

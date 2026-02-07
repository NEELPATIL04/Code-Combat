import { Router } from 'express';
import { getHint, getSolution, evaluateCode, generateCode } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/hint', authenticate, getHint);
router.post('/solution', authenticate, getSolution);
router.post('/evaluate', authenticate, evaluateCode);
router.post('/generate-code', authenticate, generateCode);

export default router;

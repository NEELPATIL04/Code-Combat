import { Router } from 'express';
import { getUserContestHistory, getUserContestDetails } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile/contests', getUserContestHistory);
router.get('/profile/contests/:contestId', getUserContestDetails);

export default router;

import { Router } from 'express';
import { getUserContestHistory, getUserContestDetails, getAllUsers, getUserProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllUsers);
router.get('/profile', getUserProfile);
router.get('/profile/contests', getUserContestHistory);
router.get('/profile/contests/:contestId', getUserContestDetails);

export default router;

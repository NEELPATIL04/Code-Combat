import { Router } from 'express';
import { getUserContestHistory, getUserContestDetails, getAllUsers, getUserProfile, updateUser } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/roleCheck.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(['admin', 'super_admin']), getAllUsers);
router.get('/profile', getUserProfile);
router.get('/profile/contests', getUserContestHistory);
router.get('/profile/contests/:contestId', getUserContestDetails);

// Admin only: Update user role/status
router.put('/:id', requireRole(['admin', 'super_admin']), updateUser);

export default router;

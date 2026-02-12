import { Router } from 'express';
import { getUserContestHistory, getUserContestDetails, getAllUsers, getUserProfile, updateUser, toggleUserStatus, deleteUser } from '../controllers/user.controller';
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

// Admin only: Toggle user status (active/banned)
router.patch('/:id/toggle-status', requireRole(['admin', 'super_admin']), toggleUserStatus);

// Admin only: Delete user
router.delete('/:id', requireRole(['admin', 'super_admin']), deleteUser);

export default router;

import { Router } from 'express';
import { getParticipantSubmissions, updateSubmissionScore, getAiUsageStats, getAiUsageLogs, getDashboardStats, getParticipantProfile } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/roleCheck.middleware';

const router = Router();

// Get Participant Submissions
router.get(
    '/participants/:userId/contest/:contestId/submissions',
    authenticate,
    requireRole(['admin', 'super_admin']),
    getParticipantSubmissions
);

// Update Submission Score
router.patch(
    '/submissions/:id/score',
    authenticate,
    requireRole(['admin', 'super_admin']),
    updateSubmissionScore
);

// AI Usage Stats
router.get(
    '/ai/stats',
    authenticate,
    requireRole(['admin', 'super_admin']),
    getAiUsageStats
);

// AI Usage Logs
router.get(
    '/ai/logs',
    authenticate,
    requireRole(['admin', 'super_admin']),
    getAiUsageLogs
);

// Dashboard Stats
router.get(
    '/dashboard',
    authenticate,
    requireRole(['admin', 'super_admin']),
    getDashboardStats
);

// Participant Profile
router.get(
    '/participants/:id',
    authenticate,
    requireRole(['admin', 'super_admin']),
    getParticipantProfile
);

// Participant Profile
router.get(
    '/participants/:id',
    authenticate,
    requireRole(['admin', 'super_admin']),
    getParticipantProfile
);

export default router;

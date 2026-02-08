import { Router } from 'express';
import {
  getContestSettings,
  updateContestSettings,
  deleteContestSettings,
} from '../controllers/contestSettings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/roleCheck.middleware';

const router = Router();

/**
 * Contest Settings Routes
 * Manages test mode, timing, and other contest configurations
 */

// Get contest settings
router.get(
  '/:id/settings',
  authenticate,
  getContestSettings
);

// Update contest settings
router.put(
  '/:id/settings',
  authenticate,
  requireRole(['admin', 'super_admin']),
  updateContestSettings
);

// Delete (reset) contest settings
router.delete(
  '/:id/settings',
  authenticate,
  requireRole(['admin', 'super_admin']),
  deleteContestSettings
);

export default router;

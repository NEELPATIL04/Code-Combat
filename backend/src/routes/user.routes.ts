import { Router } from 'express';
import { getProfile, getAllUsers } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/roleCheck.middleware';

/**
 * User Routes
 * Handles user profile and user management endpoints
 */
const router = Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 *
 * Requires: Authentication (JWT token)
 *
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Response:
 *   { id: number, username: string, email: string, role: string, createdAt: date }
 *
 * Middleware:
 *   - authenticate: Verifies JWT token and attaches user to request
 *   - getProfile: Returns user information
 */
router.get('/profile', authenticate, getProfile);

/**
 * GET /api/users
 * Get all users (admin and super_admin only)
 *
 * Requires: Authentication + Admin/Super Admin role
 *
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Response:
 *   { count: number, users: [...] }
 *
 * Middleware:
 *   - authenticate: Verifies JWT token
 *   - requireRole: Checks user has admin or super_admin role
 *   - getAllUsers: Returns list of all users
 */
router.get('/', authenticate, requireRole(['admin', 'super_admin']), getAllUsers);

export default router;

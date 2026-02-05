import { Router } from 'express';
import {
  getProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} from '../controllers/user.controller';
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

/**
 * POST /api/users
 * Create new user (admin and super_admin only)
 *
 * Requires: Authentication + Admin/Super Admin role
 *
 * Request body:
 *   { username: string, email: string, password: string, firstName?: string,
 *     lastName?: string, companySchool?: string, role?: string }
 */
router.post('/', authenticate, requireRole(['admin', 'super_admin']), createUser);

/**
 * PUT /api/users/:id
 * Update user (admin and super_admin only)
 *
 * Requires: Authentication + Admin/Super Admin role
 */
router.put('/:id', authenticate, requireRole(['admin', 'super_admin']), updateUser);

/**
 * DELETE /api/users/:id
 * Delete user (admin and super_admin only)
 *
 * Requires: Authentication + Admin/Super Admin role
 */
router.delete('/:id', authenticate, requireRole(['admin', 'super_admin']), deleteUser);

/**
 * PATCH /api/users/:id/toggle-status
 * Toggle user status (ban/unban) (admin and super_admin only)
 *
 * Requires: Authentication + Admin/Super Admin role
 */
router.patch('/:id/toggle-status', authenticate, requireRole(['admin', 'super_admin']), toggleUserStatus);

export default router;

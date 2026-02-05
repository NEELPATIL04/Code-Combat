import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth.types';

/**
 * Role-based Access Control Middleware
 * Checks if authenticated user has one of the required roles
 * Use this after the authenticate middleware
 *
 * @param allowedRoles - Array of roles that can access the route
 *
 * How it works:
 * 1. Checks if user is authenticated (req.user exists)
 * 2. Checks if user's role is in the allowed roles list
 * 3. If yes, continues to route handler
 * 4. If no, returns 403 Forbidden error
 *
 * Usage:
 *   // Only admins and super_admins can access
 *   router.get('/admin-only',
 *     authenticate,
 *     requireRole(['admin', 'super_admin']),
 *     controller
 *   );
 *
 *   // Only super_admin can access
 *   router.delete('/user/:id',
 *     authenticate,
 *     requireRole(['super_admin']),
 *     controller
 *   );
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure user is authenticated (should use authenticate middleware first)
    if (!req.user) {
      res.status(401).json({
        message: 'Authentication required'
      });
      return;
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    // User has required role, continue to route handler
    next();
  };
}

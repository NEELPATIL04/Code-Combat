import { JwtPayload } from '../utils/jwt.util';

/**
 * Extend Express Request Type
 * Adds a 'user' property to the Request object
 * This property is populated by the authenticate middleware
 * and contains the decoded JWT payload
 *
 * Usage in controllers:
 *   req.user.userId  // Access the authenticated user's ID
 *   req.user.role    // Access the authenticated user's role
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

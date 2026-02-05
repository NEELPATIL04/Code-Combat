import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to the request
 * Protected routes should use this middleware to ensure user is logged in
 *
 * How it works:
 * 1. Extracts token from Authorization header (format: "Bearer <token>")
 * 2. Verifies the token is valid and not expired
 * 3. Decodes the token and attaches user data to req.user
 * 4. Calls next() to continue to the route handler
 *
 * Usage:
 *   router.get('/protected', authenticate, controller)
 *
 * Client must send token in header:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.authorization;

    // Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'Authentication required. Please provide a valid token.'
      });
      return;
    }

    // Extract token by removing "Bearer " prefix (7 characters)
    const token = authHeader.substring(7);

    // Verify token and extract user data
    const payload = verifyToken(token);

    // Attach user data to request object for use in controllers
    req.user = payload;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Invalid or expired token. Please login again.'
    });
  }
}

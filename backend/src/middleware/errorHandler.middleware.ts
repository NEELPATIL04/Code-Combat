import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Global Error Handler Middleware
 * Catches all errors that occur in the application
 * Should be registered as the LAST middleware in index.ts
 *
 * How it works:
 * 1. Any error thrown or passed to next(error) reaches here
 * 2. Logs the error for debugging
 * 3. Sends a safe error response to the client
 * 4. In development, includes error details
 * 5. In production, hides error details for security
 *
 * Usage in index.ts:
 *   app.use(routes);            // Register routes first
 *   app.use(errorHandler);      // Register error handler LAST
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error details for debugging
  console.error('Error occurred:', error);

  // Send error response to client
  res.status(500).json({
    message: 'Internal server error',
    // Only show error details in development mode (not in production)
    error: env.NODE_ENV === 'development' ? error.message : undefined,
  });
}

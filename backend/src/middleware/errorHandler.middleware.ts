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
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error details for debugging
  console.error('❌ Error occurred in:', req.method, req.path);
  console.error('❌ Error details:', err);
  console.error('❌ Stack trace:', err.stack);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response to client
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    // Show error details in development mode
    ...(env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
      details: err.details || undefined,
    }),
  });
}

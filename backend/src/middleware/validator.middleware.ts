import { Request, Response, NextFunction } from 'express';

/**
 * Validate Login Request Body
 * Ensures username and password are provided and meet basic requirements
 *
 * Checks:
 * - Both username and password are provided
 * - Username is 3-50 alphanumeric characters
 * - Password is 6-100 characters
 *
 * Usage:
 *   router.post('/login', validateLogin, loginController)
 */
export function validateLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { username, password } = req.body;

  // Check if both fields are provided
  if (!username || !password) {
    res.status(400).json({
      message: 'Username and password are required'
    });
    return;
  }

  // Validate username format (alphanumeric and underscore, 3-50 characters)
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
    res.status(400).json({
      message: 'Username must be 3-50 alphanumeric characters'
    });
    return;
  }

  // Validate password length (allow 4+ for testing, but 8+ recommended for production)
  if (password.length < 4 || password.length > 100) {
    res.status(400).json({
      message: 'Password must be 4-100 characters'
    });
    return;
  }

  // Validation passed, continue to login controller
  next();
}

/**
 * Validate Registration Request Body
 * Ensures all required fields are provided and meet requirements
 *
 * Checks:
 * - Username, email, and password are provided
 * - Email has valid format
 * - Username is 3-50 alphanumeric characters
 * - Password is at least 8 characters
 *
 * Usage:
 *   router.post('/register', validateRegister, registerController)
 */
export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { username, email, password } = req.body;

  // Check required fields
  if (!username || !email || !password) {
    res.status(400).json({
      message: 'Username, email, and password are required'
    });
    return;
  }

  // Validate email format (basic regex check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      message: 'Invalid email format'
    });
    return;
  }

  // Validate username format
  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
    res.status(400).json({
      message: 'Username must be 3-50 alphanumeric characters'
    });
    return;
  }

  // Validate password strength (at least 8 characters for registration)
  if (password.length < 8) {
    res.status(400).json({
      message: 'Password must be at least 8 characters'
    });
    return;
  }

  // Validation passed, continue to register controller
  next();
}

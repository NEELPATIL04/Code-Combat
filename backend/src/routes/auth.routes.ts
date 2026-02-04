import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { validateLogin, validateRegister } from '../middleware/validator.middleware';

/**
 * Authentication Routes
 * Handles login and registration endpoints
 */
const router = Router();

/**
 * POST /api/auth/login
 * User login endpoint
 *
 * Request body:
 *   { username: string, password: string }
 *
 * Response:
 *   { message: string, role: string, username: string, token: string }
 *
 * Middleware:
 *   - validateLogin: Validates request body format
 *   - login: Authenticates user and returns token
 */
router.post('/login', validateLogin, login);

/**
 * POST /api/auth/register
 * User registration endpoint
 *
 * Request body:
 *   { username: string, email: string, password: string, role?: string }
 *
 * Response:
 *   { message: string, role: string, username: string, token: string }
 *
 * Middleware:
 *   - validateRegister: Validates request body format
 *   - register: Creates new user and returns token
 */
router.post('/register', validateRegister, register);

export default router;

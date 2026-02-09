import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';
import { comparePassword, hashPassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth.types';

/**
 * Login Controller
 * Authenticates user and returns JWT token
 *
 * Process:
 * 1. Extract username and password from request body
 * 2. Find user in database by username
 * 3. Verify password matches using bcrypt
 * 4. Generate JWT token with user information
 * 5. Return token and user details to client
 *
 * Response matches frontend expectations exactly
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body as LoginRequest;

    // Find user by username in database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    // Check if user exists
    if (!user) {
      res.status(401).json({
        message: 'Invalid username or password'
      });
      return;
    }

    // Verify password using bcrypt comparison
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Invalid username or password'
      });
      return;
    }

    // Generate JWT token containing user information
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Send success response (matches frontend expectations)
    const response: LoginResponse = {
      message: 'Login successful',
      role: user.role,
      username: user.username,
      userId: user.id,
      email: user.email,
      token,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'An error occurred during login'
    });
  }
}

/**
 * Register Controller
 * Creates new user account
 *
 * Process:
 * 1. Extract username, email, password, and role from request
 * 2. Check if username or email already exists
 * 3. Hash the password using bcrypt
 * 4. Insert new user into database
 * 5. Generate JWT token for automatic login
 * 6. Return token and user details
 *
 * Note: In production, you may want to restrict who can create admin accounts
 * For now, anyone can register with any role (can be restricted later)
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password, role = 'player' } = req.body as RegisterRequest;

    // Check if username already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      res.status(409).json({
        message: 'Username already exists'
      });
      return;
    }

    // Check if email already exists
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail) {
      res.status(409).json({
        message: 'Email already registered'
      });
      return;
    }

    // Hash password before storing in database
    const hashedPassword = await hashPassword(password);

    // Create new user in database
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        role,
      })
      .returning();

    // Generate token for automatic login after registration
    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });

    // Send success response
    res.status(201).json({
      message: 'User registered successfully',
      role: newUser.role,
      username: newUser.username,
      userId: newUser.id,
      email: newUser.email,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'An error occurred during registration'
    });
  }
}

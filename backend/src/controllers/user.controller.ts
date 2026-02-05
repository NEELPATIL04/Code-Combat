import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';

/**
 * Get Current User Profile
 * Returns authenticated user's information
 * Requires authentication middleware
 *
 * The user ID comes from req.user (set by authenticate middleware)
 * Password is excluded from the response for security
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from JWT (attached by authenticate middleware)
    const userId = req.user!.userId;

    // Fetch user from database (excluding password)
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Check if user exists (should always exist if token is valid)
    if (!user) {
      res.status(404).json({
        message: 'User not found'
      });
      return;
    }

    // Send user data
    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'An error occurred while fetching profile'
    });
  }
}

/**
 * Get All Users
 * Returns list of all users in the system
 * Restricted to admins and super_admins only
 *
 * Passwords are excluded from the response
 * Useful for admin dashboards to view all users
 */
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    // Fetch all users from database (excluding passwords)
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users);

    // Send users list with count
    res.status(200).json({
      count: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      message: 'An error occurred while fetching users'
    });
  }
}

import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';
import { hashPassword } from '../utils/password.util';

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
        firstName: users.firstName,
        lastName: users.lastName,
        companySchool: users.companySchool,
        status: users.status,
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
        firstName: users.firstName,
        lastName: users.lastName,
        companySchool: users.companySchool,
        status: users.status,
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

/**
 * Create New User
 * Admin can create new users with full details
 * Restricted to admins and super_admins only
 */
export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password, firstName, lastName, companySchool, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      res.status(400).json({
        message: 'Username, email, and password are required'
      });
      return;
    }

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
        message: 'Email already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        companySchool: companySchool || null,
        role: role || 'player',
        status: 'active',
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        companySchool: users.companySchool,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    next(error);
  }
}

/**
 * Update User
 * Admin can update user details and status
 * Restricted to admins and super_admins only
 */
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    const { firstName, lastName, email, companySchool, role, status, password } = req.body;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      res.status(404).json({
        message: 'User not found'
      });
      return;
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (companySchool !== undefined) updateData.companySchool = companySchool;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    // Hash new password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        companySchool: users.companySchool,
        role: users.role,
        status: users.status,
        updatedAt: users.updatedAt,
      });

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
}

/**
 * Delete User
 * Admin can delete users
 * Restricted to admins and super_admins only
 */
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = parseInt(req.params.id);

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      res.status(404).json({
        message: 'User not found'
      });
      return;
    }

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
}

/**
 * Toggle User Status (Ban/Unban)
 * Admin can ban or unban users
 * Restricted to admins and super_admins only
 */
export async function toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = parseInt(req.params.id);

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      res.status(404).json({
        message: 'User not found'
      });
      return;
    }

    // Toggle status
    const newStatus = existingUser.status === 'active' ? 'banned' : 'active';

    // Update user status
    const [updatedUser] = await db
      .update(users)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        status: users.status,
      });

    res.status(200).json({
      message: `User ${newStatus === 'banned' ? 'banned' : 'activated'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    next(error);
  }
}

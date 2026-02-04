/**
 * User Roles in the System
 * These roles determine what actions a user can perform
 */
export type UserRole = 'super_admin' | 'admin' | 'player';

/**
 * Login Request Body
 * Expected data when a user tries to log in
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login Response
 * Data sent back to the client after successful login
 * This matches the format expected by the frontend
 */
export interface LoginResponse {
  message: string;    // Success message
  role: UserRole;     // User's role (for routing)
  username: string;   // User's username (for display)
  token: string;      // JWT token (for subsequent requests)
}

/**
 * User Registration Request Body
 * Expected data when creating a new user account
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;    // Optional, defaults to 'player' if not specified
}

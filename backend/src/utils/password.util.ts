import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password
 * Uses bcrypt algorithm which automatically handles salt generation
 * 10 salt rounds provides a good balance between security and performance
 *
 * @param password - Plain text password from user input
 * @returns Hashed password string (safe to store in database)
 *
 * Example:
 *   const hashed = await hashPassword('myPassword123');
 *   // Returns: $2a$10$... (60 character string)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Higher = more secure but slower
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare plain text password with hashed password
 * Used during login to verify the user's password is correct
 *
 * @param password - Plain text password from login form
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 *
 * Example:
 *   const isValid = await comparePassword('myPassword123', user.password);
 *   if (isValid) {
 *     // Login successful
 *   }
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

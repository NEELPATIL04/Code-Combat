import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * JWT Payload Interface
 * This is the data we encode inside the JWT token
 * After authentication, this data is available in req.user
 */
export interface JwtPayload {
  userId: number;           // User's database ID
  username: string;         // User's username
  role: 'super_admin' | 'admin' | 'player'; // User's role for authorization
}

/**
 * Generate JWT Access Token
 * Creates a signed token that contains user information
 * This token is sent to the client and must be included in subsequent requests
 *
 * @param payload - User data to encode in the token
 * @returns Signed JWT token string
 *
 * Example:
 *   const token = generateToken({
 *     userId: 1,
 *     username: 'admin',
 *     role: 'admin'
 *   });
 *   // Returns: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET as any, {
    expiresIn: env.JWT_EXPIRES_IN as any, // Token will expire after this duration
  });
}

/**
 * Verify and Decode JWT Token
 * Checks if the token is valid and hasn't expired
 * Returns the decoded user data if valid
 *
 * @param token - JWT token string from Authorization header
 * @returns Decoded payload containing user information
 * @throws Error if token is invalid, expired, or tampered with
 *
 * Example:
 *   try {
 *     const payload = verifyToken(token);
 *     console.log(payload.userId); // User's ID
 *   } catch (error) {
 *     // Token is invalid
 *   }
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

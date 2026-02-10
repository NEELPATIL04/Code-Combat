import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
dotenv.config();

/**
 * Validate Environment Variables
 * Checks that all required environment variables are set
 * Throws an error if any are missing
 */
function validateEnv() {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_USER',
    'JWT_SECRET',
    'CORS_ORIGIN'
  ];

  // Find any missing variables
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate on import - fail fast if configuration is wrong
validateEnv();

/**
 * Typed Environment Variables
 * Provides type-safe access to environment configuration
 * All values are validated and have proper types
 */
export const env = {
  // Application environment (development, production, test)
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Port the server will listen on
  PORT: parseInt(process.env.PORT || '5000', 10),

  // Database connection settings
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD || '',

  // JWT token configuration
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // CORS allowed origins (comma-separated for multiple origins)
  CORS_ORIGIN: process.env.CORS_ORIGIN!.split(',').map(o => o.trim()),
} as const;

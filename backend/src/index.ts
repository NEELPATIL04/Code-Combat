import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { testDatabaseConnection, closeDatabaseConnection } from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler.middleware';

/**
 * Code Combat Backend Server
 * TypeScript + Express + PostgreSQL + Drizzle ORM
 *
 * This is the main entry point for the application
 * It sets up the Express server, middleware, routes, and database connection
 */

// Initialize Express application
const app: Application = express();

/**
 * Middleware Configuration
 * These run for every request in the order they are registered
 */

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend on different port to make requests
app.use(cors({
  origin: env.CORS_ORIGIN,  // Only allow requests from frontend
  credentials: true,         // Allow cookies and authentication headers
}));

// Parse JSON request bodies
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * API Routes
 * All routes are mounted under /api prefix
 *
 * Available endpoints:
 * - POST /api/auth/login       - User login
 * - POST /api/auth/register    - User registration
 * - GET  /api/users/profile    - Get current user (requires auth)
 * - GET  /api/users            - Get all users (admin only)
 * - GET  /api/health           - Health check
 */
app.use('/api', routes);

/**
 * Backward Compatibility for Old Login Endpoint
 * Redirects /api/login to /api/auth/login
 * This ensures frontend continues to work without changes
 */
app.post('/api/login', (req, res, next) => {
  req.url = '/api/auth/login';
  next();
}, routes);

/**
 * Error Handling Middleware
 * MUST be registered AFTER all routes
 * Catches any errors thrown in the application
 */
app.use(errorHandler);

/**
 * Start Server Function
 * Handles database connection and server startup
 */
async function startServer() {
  try {
    // Test database connection before starting server
    console.log('Testing database connection...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. Database "codeCombat" exists');
      console.error('   3. .env file has correct credentials');
      console.error('   4. Run migrations: npm run db:migrate');
      process.exit(1);
    }

    // Start listening for requests
    const server = app.listen(env.PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 Code Combat Backend Server');
      console.log('='.repeat(60));
      console.log(`📦 Environment:    ${env.NODE_ENV}`);
      console.log(`🌐 Server URL:     http://localhost:${env.PORT}`);
      console.log(`🗄️  Database:       ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}`);
      console.log(`❤️  Health Check:   http://localhost:${env.PORT}/api/health`);
      console.log(`🔐 Auth Endpoint:  http://localhost:${env.PORT}/api/auth/login`);
      console.log('='.repeat(60));
      console.log('✓ Server is ready to accept connections');
      console.log('');
    });

    /**
     * Graceful Shutdown Handler
     * Properly closes connections when server is stopped
     */
    process.on('SIGTERM', async () => {
      console.log('\n⚠️  SIGTERM received. Closing server gracefully...');
      server.close(async () => {
        await closeDatabaseConnection();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });

    // Handle Ctrl+C
    process.on('SIGINT', async () => {
      console.log('\n⚠️  SIGINT received. Closing server gracefully...');
      server.close(async () => {
        await closeDatabaseConnection();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import contestRoutes from './contest.routes';
import submissionRoutes from './submission.routes';
import uploadRoutes from './upload.routes';
import aiRoutes from './ai.routes';
import adminRoutes from './admin.routes';

/**
 * Main Router
 * Aggregates all route modules and includes health check endpoint
 */
const router = Router();

/**
 * Mount Route Modules
 * All routes are prefixed with /api in index.ts
 */

// Authentication routes: /api/auth/login, /api/auth/register
router.use('/auth', authRoutes);

// User routes: /api/users/profile, /api/users
router.use('/users', userRoutes);

// Contest routes: /api/contests
router.use('/contests', contestRoutes);

// Submission routes: /api/submissions
router.use('/submissions', submissionRoutes);

// Upload routes: /api/upload
router.use('/upload', uploadRoutes);

// AI routes: /api/ai
router.use('/ai', aiRoutes);

// Admin routes: /api/admin
router.use('/admin', adminRoutes);

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Used to verify the server is running
 * Returns server status and timestamp
 *
 * Response:
 *   { status: 'OK', timestamp: string, environment: string }
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;

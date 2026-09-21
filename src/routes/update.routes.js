import express from 'express';
import * as updateController from '../controllers/update.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Content Creator Updates Routes (Authenticated, CONTENT_CREATOR role required)
router.post(
  '/api/content-creator/updates',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  updateController.createUpdate
);

router.patch(
  '/api/content-creator/updates/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  updateController.updateUpdate
);

router.delete(
  '/api/content-creator/updates/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  updateController.deleteUpdate
);

// Public Updates Routes (No Authentication Required)
router.get('/api/updates', generalLimiter, updateController.getUpdates);
router.get('/api/updates/:id', generalLimiter, updateController.getSingleUpdate);

export default router;

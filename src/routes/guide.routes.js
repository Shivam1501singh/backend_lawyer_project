import express from 'express';
import * as guideController from '../controllers/guide.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Content Creator Guides Routes (Authenticated, CONTENT_CREATOR role required)
router.post(
  '/api/content-creator/guides',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  guideController.createGuide
);

router.patch(
  '/api/content-creator/guides/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  guideController.updateUserGuide
);

router.delete(
  '/api/content-creator/guides/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  guideController.deleteGuide
);

// Public Guides Routes (No Authentication Required)
router.get('/api/guides', generalLimiter, guideController.getGuides);
router.get('/api/guides/:id', generalLimiter, guideController.getSingleGuide);

export default router;

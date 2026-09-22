import express from 'express';
import * as lawController from '../controllers/law.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Content Creator Unified Law Routes (Authenticated, CONTENT_CREATOR role required)
router.post(
  '/api/content-creator/laws',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  lawController.createLawSection
);

router.patch(
  '/api/content-creator/laws/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  lawController.updateLawSection
);

router.delete(
  '/api/content-creator/laws/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  lawController.deleteLawSection
);

// Public Unified Law Routes (No Authentication Required)
router.get('/api/laws', generalLimiter, lawController.getLaws);
router.get('/api/laws/search', generalLimiter, lawController.searchLaws);
router.get('/api/laws/:id', generalLimiter, lawController.getSingleLawSection);

export default router;

import express from 'express';
import * as bnsController from '../controllers/bns.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Content Creator BNS Routes (Authenticated, CONTENT_CREATOR role required)
router.post(
  '/api/content-creator/bns',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  bnsController.createBNSSection
);

router.patch(
  '/api/content-creator/bns/:bnsId',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  bnsController.editBNSSection
);

// Public BNS Routes (No Authentication Required)
router.get('/api/bns', generalLimiter, bnsController.getBNSSections);
router.get('/api/bns/search', generalLimiter, bnsController.searchBNSSections);
router.get('/api/bns/:bnsId', generalLimiter, bnsController.getSingleBNSSection);

export default router;

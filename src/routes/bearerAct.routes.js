import express from 'express';
import * as bearerActController from '../controllers/bearerAct.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

/**
 * Content Creator Single Write Endpoint (Authenticated, CONTENT_CREATOR role required)
 * Handles CREATE & UPDATE for BEARER_ACT, ACT, and SECTION levels.
 */
router.post(
  '/api/content-creator/bearer-acts',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  bearerActController.contentCreatorWriteHandler
);

/**
 * Public Read Endpoints (No Authentication Required)
 */
router.get('/api/bearer-acts', generalLimiter, bearerActController.getBearerActs);
router.get('/api/bearer-acts/:id', generalLimiter, bearerActController.getSingleBearerAct);
router.get('/api/bearer-acts/:id/acts', generalLimiter, bearerActController.getActsByBearerAct);
router.get('/api/acts/:id', generalLimiter, bearerActController.getSingleAct);
router.get('/api/acts/:id/sections', generalLimiter, bearerActController.getSectionsByAct);
router.get('/api/sections/:id', generalLimiter, bearerActController.getSingleSection);

export default router;

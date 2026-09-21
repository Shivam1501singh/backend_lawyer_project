import express from 'express';
import * as advocateStatusController from '../controllers/advocate.status.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Advocate Heartbeat API
router.post(
  '/heartbeat',
  requireAuth,
  requireRole('ADVOCATE'),
  generalLimiter,
  advocateStatusController.heartbeat
);

// Manual Online/Offline Status API
router.patch(
  '/online-status',
  requireAuth,
  requireRole('ADVOCATE'),
  generalLimiter,
  advocateStatusController.updateOnlineStatus
);

export default router;

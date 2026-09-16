import express from 'express';
import * as advocateDeletionController from '../controllers/advocate.deletion.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { sendOtpLimiter, verifyOtpLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Advocate Account Deletion Flow
router.post(
  '/delete-account/request-otp',
  requireAuth,
  requireRole('ADVOCATE'),
  sendOtpLimiter,
  advocateDeletionController.requestDeleteAccountOtp
);

router.post(
  '/delete-account/verify-otp',
  requireAuth,
  requireRole('ADVOCATE'),
  verifyOtpLimiter,
  advocateDeletionController.verifyDeleteAccountOtp
);

export default router;

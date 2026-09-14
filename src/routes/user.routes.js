import express from 'express';
import * as userDeletionController from '../controllers/user.deletion.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { sendOtpLimiter, verifyOtpLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Account Deletion Flow (Authenticated Normal User)
router.post(
  '/delete-account/request-otp',
  requireAuth,
  requireRole('USER'),
  sendOtpLimiter,
  userDeletionController.requestDeleteAccountOtp
);

router.post(
  '/delete-account/verify-otp',
  requireAuth,
  requireRole('USER'),
  verifyOtpLimiter,
  userDeletionController.verifyDeleteAccountOtp
);

export default router;

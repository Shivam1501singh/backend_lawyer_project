import express from 'express';
import * as advocateResetController from '../controllers/advocateReset.controller.js';
import { forgotPasswordLimiter, verifyOtpLimiter, generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Advocate Forgot Password / Reset Password Endpoints
router.post('/api/advocate/forgot-password', forgotPasswordLimiter, advocateResetController.forgotPassword);
router.post('/api/advocate/resend-reset-otp', forgotPasswordLimiter, advocateResetController.resendResetOtp);
router.post('/api/advocate/verify-reset-otp', verifyOtpLimiter, advocateResetController.verifyResetOtp);
router.post('/api/advocate/reset-password', generalLimiter, advocateResetController.resetPassword);

export default router;

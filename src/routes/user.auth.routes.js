import express from 'express';
import * as userController from '../controllers/user.auth.controller.js';
import { sendOtpLimiter, verifyOtpLimiter, generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Registration Flow
router.post('/register/start', generalLimiter, userController.startRegistration);
router.post('/register/resend-email-otp', sendOtpLimiter, userController.sendEmailOtp);
router.get('/register/session/:registrationId', generalLimiter, userController.getRegistrationSession);
router.post('/send-email-otp', sendOtpLimiter, userController.sendEmailOtp);
router.post('/verify-email', verifyOtpLimiter, userController.verifyEmailOtp);
router.post('/profile', generalLimiter, userController.completeProfile);
router.post('/send-phone-otp', sendOtpLimiter, userController.sendPhoneOtp);
router.post('/verify-phone', verifyOtpLimiter, userController.verifyPhone);

// Login Flow
router.post('/login/send-otp', sendOtpLimiter, userController.loginSendOtp);
router.post('/login/verify-otp', verifyOtpLimiter, userController.loginVerifyOtp);
router.post('/login/send-email-otp', sendOtpLimiter, userController.loginSendEmailOtp);
router.post('/login/verify-email-otp', verifyOtpLimiter, userController.loginVerifyEmailOtp);

export default router;

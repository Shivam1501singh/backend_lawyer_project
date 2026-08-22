import express from 'express';
import multer from 'multer';
import * as advocateController from '../controllers/advocate.auth.controller.js';
import { sendOtpLimiter, verifyOtpLimiter, generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Registration Flow
router.post('/register/start', generalLimiter, advocateController.startRegistration);
router.post('/register/resend-email-otp', sendOtpLimiter, advocateController.sendEmailOtp);
router.get('/register/session/:registrationId', generalLimiter, advocateController.getRegistrationSession);
router.post('/upload-profile-photo', generalLimiter, upload.single('profilePhoto'), advocateController.uploadProfilePhoto);
router.post('/send-email-otp', sendOtpLimiter, advocateController.sendEmailOtp);
router.post('/verify-email', verifyOtpLimiter, advocateController.verifyEmailOtp);
router.post('/profile', generalLimiter, advocateController.completeProfile);
router.post('/send-phone-otp', sendOtpLimiter, advocateController.sendPhoneOtp);
router.post('/verify-phone', verifyOtpLimiter, advocateController.verifyPhone);
router.post('/aadhaar/initiate', generalLimiter, advocateController.initiateAadhaar);
router.post('/aadhaar/verify', generalLimiter, advocateController.verifyAadhaar);

// Login Flow
router.post('/login', generalLimiter, advocateController.loginEmailPassword);
router.post('/login/send-otp', sendOtpLimiter, advocateController.loginSendOtp);
router.post('/login/verify-otp', verifyOtpLimiter, advocateController.loginVerifyOtp);

export default router;

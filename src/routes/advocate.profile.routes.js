import express from 'express';
import multer from 'multer';
import * as advocateProfileController from '../controllers/advocate.profile.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Require authentication for all advocate profile endpoints
router.use(requireAuth);

router.get('/', generalLimiter, advocateProfileController.getProfile);
router.get('/verification-status', generalLimiter, advocateProfileController.getVerificationStatus);
router.patch('/', generalLimiter, advocateProfileController.updateProfile);
router.post('/photo', generalLimiter, upload.single('profilePhoto'), advocateProfileController.uploadProfilePhoto);
router.post('/submit-for-approval', generalLimiter, advocateProfileController.submitForApproval);

export default router;

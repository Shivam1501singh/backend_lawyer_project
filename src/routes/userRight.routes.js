import express from 'express';
import multer from 'multer';
import * as userRightController from '../controllers/userRight.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Content Creator User Rights Routes (Authenticated, CONTENT_CREATOR role required)
router.post(
  '/api/content-creator/user-rights',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  upload.single('photo'),
  userRightController.createUserRight
);

router.patch(
  '/api/content-creator/user-rights/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  upload.single('photo'),
  userRightController.updateUserRight
);

router.delete(
  '/api/content-creator/user-rights/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  userRightController.deleteUserRight
);

// Public User Rights Routes (No Authentication Required)
router.get('/api/user-rights', generalLimiter, userRightController.getUserRights);
router.get('/api/user-rights/:id', generalLimiter, userRightController.getSingleUserRight);

export default router;

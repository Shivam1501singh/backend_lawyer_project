import express from 'express';
import * as feedbackController from '../controllers/feedback.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

export const userFeedbackRouter = express.Router();
export const adminFeedbackRouter = express.Router();

// User Feedback Route (USER only)
userFeedbackRouter.post(
  '/',
  requireAuth,
  requireRole('USER'),
  generalLimiter,
  feedbackController.submitFeedback
);

// Admin Feedback Routes (ADMIN only)
adminFeedbackRouter.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  generalLimiter,
  feedbackController.adminListFeedbacks
);

adminFeedbackRouter.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  generalLimiter,
  feedbackController.adminDeleteFeedback
);

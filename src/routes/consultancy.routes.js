import express from 'express';
import * as consultancyController from '../controllers/consultancy.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

export const userConsultancyRouter = express.Router();
export const adminConsultancyRouter = express.Router();

// User Consultancy Routes (USER only)
userConsultancyRouter.post(
  '/',
  requireAuth,
  requireRole('USER'),
  generalLimiter,
  consultancyController.createUserRequest
);

userConsultancyRouter.get(
  '/',
  requireAuth,
  requireRole('USER'),
  generalLimiter,
  consultancyController.getUserRequests
);

userConsultancyRouter.get(
  '/:id',
  requireAuth,
  requireRole('USER'),
  generalLimiter,
  consultancyController.getUserRequestById
);

// Admin Consultancy Routes (ADMIN only)
adminConsultancyRouter.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  generalLimiter,
  consultancyController.adminListRequests
);

adminConsultancyRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  generalLimiter,
  consultancyController.adminMarkCompleted
);

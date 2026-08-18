import express from 'express';
import * as helpController from '../controllers/help.controller.js';
import { helpLimiter } from '../middleware/rate-limit.middleware.js';

export const helpRouter = express.Router();
export const adminHelpRouter = express.Router();

// Publicly accessible endpoints (No Auth required)
helpRouter.post('/', helpLimiter, helpController.createRequest);
helpRouter.post('/lookup', helpLimiter, helpController.lookupRequest);

// Protected Admin / Support endpoints (require Admin secret verification)
const requireAdmin = (req, res, next) => {
  const adminSecret = process.env.ADMIN_SECRET || 'super-admin-secret';
  if (req.headers['x-admin-secret'] === adminSecret) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access forbidden. Support/Admin authorization required.'
  });
};

adminHelpRouter.use(requireAdmin);

adminHelpRouter.get('/', helpController.adminListRequests);
adminHelpRouter.get('/:id', helpController.adminGetDetails);
adminHelpRouter.patch('/:id', helpController.submitAdminResponse);

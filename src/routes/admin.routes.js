import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Admin Authentication (Public)
router.post('/login', generalLimiter, adminController.loginAdmin);

// Admin-only Content Creator Management
router.post('/content-creators', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.createContentCreator);
router.get('/content-creators', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.listContentCreators);

// Admin-only Advocate Management
router.get('/advocates', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.listAdvocates);
router.patch('/advocates/:advocateId/status', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.updateAdvocateStatus);

export default router;

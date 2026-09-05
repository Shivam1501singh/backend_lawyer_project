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
router.get('/advocates/pending', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.listPendingAdvocates);
router.get('/advocates', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.listAdvocates);
router.get('/advocates/:advocateId', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.getAdvocateReviewProfile);
router.patch('/advocates/:advocateId/approve', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.approveAdvocate);
router.patch('/advocates/:advocateId/reject', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.rejectAdvocate);
router.patch('/advocates/:advocateId/status', requireAuth, requireRole('ADMIN'), generalLimiter, adminController.updateAdvocateStatus);

export default router;

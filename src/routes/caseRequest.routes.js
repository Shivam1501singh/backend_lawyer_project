import express from 'express';
import multer from 'multer';
import * as caseRequestController from '../controllers/caseRequest.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. User Connection Request Endpoints
router.post(
  '/api/lawyers/:advocateId/connect',
  requireAuth,
  requireRole('USER'),
  generalLimiter,
  upload.array('images', 5),
  caseRequestController.createRequest
);

router.get(
  '/api/user/case-requests',
  requireAuth,
  requireRole('USER'),
  generalLimiter,
  caseRequestController.getUserRequests
);

router.get(
  '/api/user/case-requests/:requestId',
  requireAuth,
  requireRole('USER'),
  generalLimiter,
  caseRequestController.getUserRequestById
);

// 2. Admin Case Request Endpoints
router.get(
  '/api/admin/case-requests',
  requireAuth,
  requireRole('ADMIN'),
  generalLimiter,
  caseRequestController.getAdminRequests
);

router.get(
  '/api/admin/case-requests/:requestId',
  requireAuth,
  requireRole('ADMIN'),
  generalLimiter,
  caseRequestController.getAdminRequestById
);

router.patch(
  '/api/admin/case-requests/:requestId/connect',
  requireAuth,
  requireRole('ADMIN'),
  generalLimiter,
  caseRequestController.connectRequest
);

router.patch(
  '/api/admin/case-requests/:requestId/reject',
  requireAuth,
  requireRole('ADMIN'),
  generalLimiter,
  caseRequestController.rejectRequest
);

// 3. Advocate Case Connection Endpoints
router.get(
  '/api/advocate/case-connections',
  requireAuth,
  requireRole('ADVOCATE'),
  generalLimiter,
  caseRequestController.getAdvocateConnections
);

router.get(
  '/api/advocate/case-connections/:connectionId',
  requireAuth,
  requireRole('ADVOCATE'),
  generalLimiter,
  caseRequestController.getAdvocateConnectionById
);

// 4. Secure Attachment Viewing Endpoint
router.get(
  '/api/case-requests/:requestId/attachments/:attachmentId',
  requireAuth,
  generalLimiter,
  caseRequestController.getAttachmentFile
);

export default router;

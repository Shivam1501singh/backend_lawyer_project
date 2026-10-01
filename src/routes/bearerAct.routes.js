import express from 'express';
import * as bearerActController from '../controllers/bearerAct.controller.js';
import * as actPdfController from '../controllers/actPdf.controller.js';
import { handleActPdfUpload } from '../middleware/actPdfUpload.middleware.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

/**
 * Content Creator Single Write Endpoint (Authenticated, CONTENT_CREATOR role required)
 * Handles CREATE & UPDATE for BEARER_ACT, ACT, and SECTION levels.
 */
router.post(
  '/api/content-creator/bearer-acts',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  bearerActController.contentCreatorWriteHandler
);

/**
 * Content Creator PDF Upload & Management Endpoints (Authenticated, CONTENT_CREATOR role required)
 */
router.post(
  '/api/content-creator/acts/:actId/pdfs',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  handleActPdfUpload,
  actPdfController.uploadActPdfsHandler
);

router.post(
  '/api/content-creator/acts/pdfs',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  handleActPdfUpload,
  actPdfController.uploadActPdfsHandler
);

router.post(
  '/api/content-creator/acts/:actId/predefined-pdfs',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  actPdfController.attachPredefinedPdfHandler
);

router.post(
  '/api/content-creator/acts/predefined-pdfs/sync',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  actPdfController.syncPredefinedPdfsHandler
);

router.delete(
  '/api/content-creator/acts/pdfs/:id',
  requireAuth,
  requireRole('CONTENT_CREATOR'),
  generalLimiter,
  actPdfController.deleteActPdfHandler
);

/**
 * Public PDF Endpoints (No Authentication Required)
 */
router.get('/api/acts/:actId/pdfs', generalLimiter, actPdfController.getActPdfs);
router.get('/api/acts/pdfs/:id', generalLimiter, actPdfController.getSinglePdfDetails);
router.get('/api/pdfs/:id', generalLimiter, actPdfController.getSinglePdfDetails);
router.get('/api/acts/pdfs/:id/view', generalLimiter, actPdfController.viewPdf);
router.get('/api/pdfs/:id/view', generalLimiter, actPdfController.viewPdf);
router.get('/api/acts/pdfs/:id/download', generalLimiter, actPdfController.downloadPdf);
router.get('/api/pdfs/:id/download', generalLimiter, actPdfController.downloadPdf);

/**
 * Public Search Endpoints (No Authentication Required)
 */
router.get('/api/bearer-acts/search', generalLimiter, bearerActController.searchGlobalBearerActs);
router.get('/api/acts/:actId/search', generalLimiter, bearerActController.searchActSections);

/**
 * Public Read Endpoints (No Authentication Required)
 */
router.get('/api/bearer-acts', generalLimiter, bearerActController.getBearerActs);
router.get('/api/bearer-acts/:id', generalLimiter, bearerActController.getSingleBearerAct);
router.get('/api/bearer-acts/:id/acts', generalLimiter, bearerActController.getActsByBearerAct);
router.get('/api/acts/:id', generalLimiter, bearerActController.getSingleAct);
router.get('/api/acts/:id/sections', generalLimiter, bearerActController.getSectionsByAct);
router.get('/api/sections/:id', generalLimiter, bearerActController.getSingleSection);

export default router;


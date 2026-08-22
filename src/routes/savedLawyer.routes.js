import express from 'express';
import * as savedLawyerController from '../controllers/savedLawyer.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// All saved lawyer routes require authentication
router.use(requireAuth);

router.post('/', savedLawyerController.saveLawyer);
router.get('/', savedLawyerController.getSavedLawyers);
router.delete('/:advocateId', savedLawyerController.removeSavedLawyer);

export default router;

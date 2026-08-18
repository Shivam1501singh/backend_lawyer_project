import express from 'express';
import * as advocateController from '../controllers/advocate.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { reviewLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// Public routes
router.get('/', advocateController.getAdvocatesDirectory);
router.get('/:id', advocateController.getAdvocateProfilePublic);
router.get('/:id/reviews', reviewController.getReviewsList);

// Authenticated User routes
router.post('/:advocateId/review', requireAuth, reviewLimiter, reviewController.submitReview);
router.patch('/:advocateId/review', requireAuth, reviewLimiter, reviewController.editReview);
router.delete('/:advocateId/review', requireAuth, reviewLimiter, reviewController.removeReview);

export default router;

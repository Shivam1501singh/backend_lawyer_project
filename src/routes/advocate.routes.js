import express from 'express';
import * as advocateController from '../controllers/advocate.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import * as advocateLikeController from '../controllers/advocateLike.controller.js';
import * as advocateTeamController from '../controllers/advocateTeam.controller.js';
import { requireAuth, optionalAuth, requireRole } from '../middleware/auth.middleware.js';
import { reviewLimiter, generalLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// 1. Advocate Team Mate Routes (Must be defined before /:id)
router.get('/search', requireAuth, requireRole('ADVOCATE'), generalLimiter, advocateTeamController.searchAdvocateByBarId);
router.get('/team-mates', requireAuth, requireRole('ADVOCATE'), generalLimiter, advocateTeamController.getTeamMates);
router.delete('/team-mates/:advocateId', requireAuth, requireRole('ADVOCATE'), generalLimiter, advocateTeamController.removeTeamMate);
router.post('/team-request/:requestId/verify', requireAuth, requireRole('ADVOCATE'), generalLimiter, advocateTeamController.verifyTeamRequest);
router.post('/:advocateId/team-request', requireAuth, requireRole('ADVOCATE'), generalLimiter, advocateTeamController.createTeamRequest);

// 2. Public / Optional Auth routes
router.get('/', optionalAuth, advocateController.getAdvocatesDirectory);
router.get('/:id', optionalAuth, advocateController.getAdvocateProfilePublic);
router.get('/:id/reviews', reviewController.getReviewsList);

// 3. Authenticated User Like routes
router.post('/:advocateId/like', requireAuth, requireRole('USER'), advocateLikeController.likeAdvocate);
router.delete('/:advocateId/like', requireAuth, requireRole('USER'), advocateLikeController.unlikeAdvocate);

// 4. Authenticated User Review routes
router.post('/:advocateId/review', requireAuth, reviewLimiter, reviewController.submitReview);
router.patch('/:advocateId/review', requireAuth, reviewLimiter, reviewController.editReview);
router.delete('/:advocateId/review', requireAuth, reviewLimiter, reviewController.removeReview);

export default router;

import * as reviewService from '../services/review.service.js';
import * as reviewValidator from '../validators/review.validator.js';
import prisma from '../lib/prisma.js';

export const submitReview = async (req, res, next) => {
  try {
    // Enforce Standard User type only
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can submit reviews.'
      });
    }

    const { advocateId } = req.params;
    const validated = reviewValidator.reviewSchema.parse(req.body);

    const review = await reviewService.createReview({
      userId: req.user.id,
      advocateId,
      rating: validated.rating,
      reviewText: validated.reviewText
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      review
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const editReview = async (req, res, next) => {
  try {
    // Enforce Standard User type only
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can edit reviews.'
      });
    }

    const { advocateId } = req.params;
    const validated = reviewValidator.reviewSchema.parse(req.body);

    const review = await reviewService.updateReview({
      userId: req.user.id,
      advocateId,
      rating: validated.rating,
      reviewText: validated.reviewText
    });

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      review
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const removeReview = async (req, res, next) => {
  try {
    // Enforce Standard User type only
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only standard users can delete reviews.'
      });
    }

    const { advocateId } = req.params;

    await reviewService.deleteReview({
      userId: req.user.id,
      advocateId
    });

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const getReviewsList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    // Check if advocate exists
    const advocate = await prisma.advocate.findUnique({
      where: { id }
    });
    if (!advocate || !advocate.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found.'
      });
    }

    const result = await reviewService.listReviewsForAdvocate(id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10
    });

    // Calculate dynamic rating distribution
    const allReviews = await prisma.review.findMany({
      where: { advocateId: id },
      select: { rating: true }
    });

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
    allReviews.forEach(r => {
      const rounded = Math.floor(parseFloat(r.rating));
      if (rounded >= 0 && rounded <= 5) {
        distribution[rounded]++;
      }
    });

    return res.status(200).json({
      success: true,
      ...result,
      summary: {
        averageRating: advocate.averageRating,
        totalReviews: advocate.totalReviews,
        distribution
      }
    });
  } catch (error) {
    next(error);
  }
};

import prisma from '../lib/prisma.js';

/**
 * Calculates average rating and total reviews count for an advocate,
 * updating the advocate record transactionally.
 */
export const updateAdvocateRatingStats = async (advocateId) => {
  const reviews = await prisma.review.findMany({
    where: { advocateId }
  });

  const totalReviews = reviews.length;
  let averageRating = null;

  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, r) => acc + parseFloat(r.rating), 0);
    // Round to 1 decimal place using standard round-half-up
    averageRating = Math.round((sum / totalReviews) * 10) / 10;
  }

  await prisma.advocate.update({
    where: { id: advocateId },
    data: {
      averageRating,
      totalReviews
    }
  });
};

/**
 * Submits a new review.
 */
export const createReview = async ({ userId, advocateId, rating, reviewText }) => {
  // 1. Verify Advocate exists and is active
  const advocate = await prisma.advocate.findUnique({
    where: { id: advocateId }
  });

  if (!advocate || !advocate.isActive) {
    const error = new Error('Advocate not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Check duplicate review
  const existing = await prisma.review.findUnique({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  if (existing) {
    const error = new Error('You have already reviewed this advocate.');
    error.statusCode = 409;
    throw error;
  }

  // 3. Create review
  const review = await prisma.review.create({
    data: {
      userId,
      advocateId,
      rating,
      reviewText: reviewText ? reviewText.trim() : null
    }
  });

  // 4. Update rating statistics
  await updateAdvocateRatingStats(advocateId);

  return review;
};

/**
 * Updates an existing review.
 */
export const updateReview = async ({ userId, advocateId, rating, reviewText }) => {
  // 1. Find review
  const existing = await prisma.review.findUnique({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  if (!existing) {
    const error = new Error('Review not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Update review
  const updatedReview = await prisma.review.update({
    where: {
      userId_advocateId: { userId, advocateId }
    },
    data: {
      rating,
      reviewText: reviewText ? reviewText.trim() : null
    }
  });

  // 3. Update rating statistics
  await updateAdvocateRatingStats(advocateId);

  return updatedReview;
};

/**
 * Deletes a review.
 */
export const deleteReview = async ({ userId, advocateId }) => {
  // 1. Find review
  const existing = await prisma.review.findUnique({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  if (!existing) {
    const error = new Error('Review not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Delete review
  await prisma.review.delete({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  // 3. Update rating statistics
  await updateAdvocateRatingStats(advocateId);
  
  return true;
};

/**
 * Lists reviews for an advocate with pagination.
 */
export const listReviewsForAdvocate = async (advocateId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const [total, reviews] = await prisma.$transaction([
    prisma.review.count({ where: { advocateId } }),
    prisma.review.findMany({
      where: { advocateId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        reviewText: true,
        createdAt: true,
        user: {
          select: {
            fullName: true
          }
        }
      }
    })
  ]);

  return {
    reviews,
    pagination: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  };
};

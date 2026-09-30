import prisma from '../lib/prisma.js';

/**
 * User: Submit feedback
 * Populates name and phone from the authenticated user's profile
 */
export const submitFeedback = async ({ userId, description }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      phone: true
    }
  });

  if (!user) {
    const err = new Error('User account not found.');
    err.statusCode = 404;
    throw err;
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId: user.id,
      name: user.fullName,
      phone: user.phone,
      description: description.trim()
    }
  });

  return feedback;
};

/**
 * Admin: List all submitted feedback with pagination (latest first)
 */
export const listFeedbacksAdmin = async ({ page = 1, limit = 10 } = {}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;
  const take = parsedLimit;

  const [total, feedbacks] = await prisma.$transaction([
    prisma.feedback.count(),
    prisma.feedback.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  return {
    feedbacks,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1
    }
  };
};

/**
 * Admin: Delete feedback by ID
 */
export const deleteFeedbackAdmin = async (id) => {
  const existingFeedback = await prisma.feedback.findUnique({
    where: { id }
  });

  if (!existingFeedback) {
    const err = new Error('Feedback not found.');
    err.statusCode = 404;
    throw err;
  }

  const deletedFeedback = await prisma.feedback.delete({
    where: { id }
  });

  return deletedFeedback;
};

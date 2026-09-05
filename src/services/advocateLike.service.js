import prisma from '../lib/prisma.js';

/**
 * Normal User likes an Advocate.
 */
export const likeAdvocate = async ({ userId, advocateId }) => {
  // 1. Verify advocate exists
  const advocate = await prisma.advocate.findUnique({
    where: { id: advocateId }
  });

  if (!advocate) {
    const error = new Error('Advocate not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify advocate is ACTIVE and APPROVED
  if (!advocate.isActive || advocate.status !== 'ACTIVE' || advocate.approvalStatus !== 'APPROVED') {
    const error = new Error('This lawyer is currently unavailable.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Check for existing like
  const existingLike = await prisma.advocateLike.findUnique({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  if (existingLike) {
    const error = new Error('You have already liked this advocate.');
    error.statusCode = 409;
    throw error;
  }

  // 4. Create like record
  await prisma.advocateLike.create({
    data: { userId, advocateId }
  });

  // 5. Get updated total count
  const likeCount = await prisma.advocateLike.count({
    where: { advocateId }
  });

  return {
    advocateId,
    liked: true,
    likeCount
  };
};

/**
 * Normal User unlikes an Advocate.
 */
export const unlikeAdvocate = async ({ userId, advocateId }) => {
  // 1. Check for existing like
  const existingLike = await prisma.advocateLike.findUnique({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  if (!existingLike) {
    const error = new Error('You have not liked this advocate.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Delete like record
  await prisma.advocateLike.delete({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  // 3. Get updated total count
  const likeCount = await prisma.advocateLike.count({
    where: { advocateId }
  });

  return {
    advocateId,
    liked: false,
    likeCount
  };
};

/**
 * Retrieves all Advocates liked by the authenticated User.
 */
export const getUserLikedAdvocates = async (userId) => {
  const likes = await prisma.advocateLike.findMany({
    where: { userId },
    include: {
      advocate: {
        include: {
          _count: {
            select: { likes: true }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Filter for active and approved advocates and format response
  return likes
    .filter(l => l.advocate && l.advocate.isActive && l.advocate.status === 'ACTIVE' && l.advocate.approvalStatus === 'APPROVED')
    .map(l => {
      const adv = l.advocate;
      return {
        id: adv.id,
        name: adv.fullName,
        fullName: adv.fullName,
        profilePhotoUrl: adv.profilePhotoUrl,
        gender: adv.gender,
        experienceYears: adv.experienceYears,
        casesWon: adv.casesWon,
        practiceAreas: adv.practiceAreas,
        topCourtPractised: adv.topCourtPractised,
        bestPracticeArea: adv.bestPracticeArea,
        about: adv.about,
        courtPractice: adv.courtPractice,
        languagesSpoken: adv.languagesSpoken,
        state: adv.state,
        city: adv.city,
        completeAddress: adv.completeAddress,
        videoCallChargePerMinute: adv.videoCallChargePerMinute !== null ? Number(adv.videoCallChargePerMinute) : null,
        voiceCallChargePerMinute: adv.voiceCallChargePerMinute !== null ? Number(adv.voiceCallChargePerMinute) : null,
        offlineVisitingFee: adv.offlineVisitingFee !== null ? Number(adv.offlineVisitingFee) : null,
        averageRating: adv.averageRating !== null ? Number(adv.averageRating) : null,
        totalReviews: adv.totalReviews,
        status: adv.status,
        likeCount: adv._count?.likes ?? 0,
        isLiked: true
      };
    });
};

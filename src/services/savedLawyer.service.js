import prisma from '../lib/prisma.js';

/**
 * Saves a lawyer for a user.
 */
export const saveLawyer = async ({ userId, advocateId }) => {
  // Validate that advocate exists and is active
  const advocate = await prisma.advocate.findUnique({
    where: { id: advocateId }
  });

  if (!advocate || !advocate.isActive) {
    const error = new Error('Advocate not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if relationship already exists
  const existing = await prisma.savedLawyer.findUnique({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  if (existing) {
    const error = new Error('Lawyer is already saved');
    error.statusCode = 400;
    throw error;
  }

  // Create SavedLawyer record
  return await prisma.savedLawyer.create({
    data: { userId, advocateId }
  });
};

/**
 * Retrieves all saved lawyers for a user.
 */
export const listSavedLawyers = async (userId) => {
  const saved = await prisma.savedLawyer.findMany({
    where: { userId },
    include: {
      advocate: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Filter out any advocates that are not active and map to public profiles
  return saved
    .filter(s => s.advocate && s.advocate.isActive)
    .map(s => {
      const adv = s.advocate;
      return {
        id: adv.id,
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
        isSaved: true
      };
    });
};

/**
 * Deletes a saved lawyer record.
 */
export const deleteSavedLawyer = async ({ userId, advocateId }) => {
  const existing = await prisma.savedLawyer.findUnique({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });

  if (!existing) {
    const error = new Error('Saved lawyer not found');
    error.statusCode = 400;
    throw error;
  }

  await prisma.savedLawyer.delete({
    where: {
      userId_advocateId: { userId, advocateId }
    }
  });
};

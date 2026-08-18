import prisma from '../lib/prisma.js';

/**
 * Lists active, completed advocates with pagination, search, sorting, and filters.
 */
export const listAdvocates = async ({
  page = 1,
  limit = 12,
  search,
  sort,
  practiceAreaId,
  topCourtPractisedId,
  practiceArea,
  topCourtPractised,
  bestPracticeArea,
  courtPractice,
  state,
  city,
  experienceYears,
  rating
}) => {
  const skip = (page - 1) * limit;
  const take = parseInt(limit, 10);

  const where = {
    isActive: true,
    phoneVerified: true,
    emailVerified: true
  };

  // 1. Search (Matches Name, topCourtPractised, City, State case-insensitively, and practiceAreas exact match)
  if (search && search.trim()) {
    const cleanSearch = search.trim();
    where.OR = [
      { fullName: { contains: cleanSearch, mode: 'insensitive' } },
      { topCourtPractised: { contains: cleanSearch, mode: 'insensitive' } },
      { city: { contains: cleanSearch, mode: 'insensitive' } },
      { state: { contains: cleanSearch, mode: 'insensitive' } },
      { practiceAreas: { has: cleanSearch } }
    ];
  }

  // 2. Filters
  const filterArea = practiceArea || practiceAreaId;
  if (filterArea) {
    where.practiceAreas = { has: filterArea };
  }

  const filterCourt = topCourtPractised || topCourtPractisedId;
  if (filterCourt) {
    where.topCourtPractised = { equals: filterCourt, mode: 'insensitive' };
  }

  if (bestPracticeArea) {
    where.bestPracticeArea = bestPracticeArea;
  }
  if (courtPractice) {
    where.courtPractice = { has: courtPractice };
  }
  if (state) {
    where.state = { equals: state, mode: 'insensitive' };
  }
  if (city) {
    where.city = { equals: city, mode: 'insensitive' };
  }
  if (experienceYears) {
    where.experienceYears = { gte: parseInt(experienceYears, 10) };
  }
  if (rating) {
    where.averageRating = { gte: parseFloat(rating) };
  }

  // 3. Sorting
  let orderBy = { createdAt: 'desc' }; // Default sort
  const allowedSortKeys = {
    rating: { averageRating: 'desc' },
    experience: { experienceYears: 'desc' },
    casesWon: { casesWon: 'desc' }
  };

  if (sort && allowedSortKeys[sort]) {
    orderBy = allowedSortKeys[sort];
  }

  const [total, advocates] = await prisma.$transaction([
    prisma.advocate.count({ where }),
    prisma.advocate.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        fullName: true,
        profilePhotoUrl: true,
        experienceYears: true,
        casesWon: true,
        practiceAreas: true,
        topCourtPractised: true,
        bestPracticeArea: true,
        courtPractice: true,
        languagesSpoken: true,
        state: true,
        city: true,
        videoCallChargePerMinute: true,
        voiceCallChargePerMinute: true,
        offlineVisitingFee: true,
        averageRating: true,
        totalReviews: true
      }
    })
  ]);

  return {
    advocates,
    pagination: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  };
};

/**
 * Gets the complete public details of an active advocate.
 */
export const getAdvocateDetailsPublic = async (id) => {
  const advocate = await prisma.advocate.findUnique({
    where: { id }
  });

  if (!advocate || !advocate.isActive) {
    const error = new Error('Advocate not found.');
    error.statusCode = 404;
    throw error;
  }

  // Exclude all sensitive details
  return {
    id: advocate.id,
    fullName: advocate.fullName,
    profilePhotoUrl: advocate.profilePhotoUrl,
    gender: advocate.gender,
    experienceYears: advocate.experienceYears,
    casesWon: advocate.casesWon,
    practiceAreas: advocate.practiceAreas,
    topCourtPractised: advocate.topCourtPractised,
    bestPracticeArea: advocate.bestPracticeArea,
    about: advocate.about,
    courtPractice: advocate.courtPractice,
    languagesSpoken: advocate.languagesSpoken,
    state: advocate.state,
    city: advocate.city,
    // pincode is NOT exposed publicly
    completeAddress: advocate.completeAddress,
    videoCallChargePerMinute: advocate.videoCallChargePerMinute,
    voiceCallChargePerMinute: advocate.voiceCallChargePerMinute,
    offlineVisitingFee: advocate.offlineVisitingFee,
    averageRating: advocate.averageRating,
    totalReviews: advocate.totalReviews
  };
};

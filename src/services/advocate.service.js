import prisma from '../lib/prisma.js';

// Hardcoded mapping of coordinates for the common Indian pincodes used in the seed data/locations
const PINCODE_COORDINATES = {
  '110001': { latitude: 28.6304, longitude: 77.2177 }, // New Delhi (Connaught Place)
  '110002': { latitude: 28.6438, longitude: 77.2415 }, // Daryaganj
  '400001': { latitude: 18.9696, longitude: 72.8230 }, // Mumbai (Fort)
  '400021': { latitude: 18.9256, longitude: 72.8242 }, // Nariman Point
  '411001': { latitude: 18.5284, longitude: 73.8739 }, // Pune
  '560001': { latitude: 12.9716, longitude: 77.5946 }, // Bengaluru
  '560025': { latitude: 12.9619, longitude: 77.6015 }, // Richmond Town
  '600001': { latitude: 13.0827, longitude: 80.2707 }, // Chennai
  '700001': { latitude: 22.5726, longitude: 88.3639 }, // Kolkata
  '201301': { latitude: 28.5800, longitude: 77.3300 }, // Noida
  '226001': { latitude: 26.8467, longitude: 80.9462 }, // Lucknow
  '380001': { latitude: 23.0225, longitude: 72.5714 }, // Ahmedabad
  '302001': { latitude: 26.9124, longitude: 75.7873 }, // Jaipur
  '500001': { latitude: 17.3850, longitude: 78.4867 }, // Hyderabad
  '682001': { latitude: 9.9816, longitude: 76.2999 },  // Kochi
  '682011': { latitude: 9.9700, longitude: 76.2800 }   // Kochi Ernakulam
};

const resolvePincodeCoordinates = async (pincode) => {
  // 1. Static lookup
  if (PINCODE_COORDINATES[pincode]) {
    return PINCODE_COORDINATES[pincode];
  }

  // 2. Database lookup - check Advocate table
  const advocateLoc = await prisma.advocate.findFirst({
    where: {
      pincode: pincode,
      latitude: { not: null },
      longitude: { not: null }
    },
    select: { latitude: true, longitude: true }
  });
  if (advocateLoc && advocateLoc.latitude !== null && advocateLoc.longitude !== null) {
    return { latitude: advocateLoc.latitude, longitude: advocateLoc.longitude };
  }

  // 3. Database lookup - check User table
  const userLoc = await prisma.user.findFirst({
    where: {
      pincode: pincode,
      latitude: { not: null },
      longitude: { not: null }
    },
    select: { latitude: true, longitude: true }
  });
  if (userLoc && userLoc.latitude !== null && userLoc.longitude !== null) {
    return { latitude: userLoc.latitude, longitude: userLoc.longitude };
  }

  // Throw controlled error
  throw new Error(`Invalid pincode. Location not found for pincode: ${pincode}`);
};

const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const getAdvocateCoordinates = (advocate) => {
  if (advocate.latitude !== null && advocate.longitude !== null) {
    return { latitude: advocate.latitude, longitude: advocate.longitude };
  }
  if (advocate.pincode && PINCODE_COORDINATES[advocate.pincode]) {
    return PINCODE_COORDINATES[advocate.pincode];
  }
  return null;
};

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
  rating,
  pincode,
  currentUserId
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

  const selectFields = {
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
    totalReviews: true,
    pincode: true,
    latitude: true,
    longitude: true
  };

  // Resolve user coords if logged in
  let userCoords = null;
  let savedLawyerIds = new Set();
  if (currentUserId) {
    const [dbUser, saved] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: currentUserId },
        select: { latitude: true, longitude: true, pincode: true }
      }),
      prisma.savedLawyer.findMany({
        where: { userId: currentUserId },
        select: { advocateId: true }
      })
    ]);
    if (dbUser) {
      if (dbUser.latitude !== null && dbUser.longitude !== null) {
        userCoords = { latitude: dbUser.latitude, longitude: dbUser.longitude };
      } else if (dbUser.pincode) {
        try {
          userCoords = await resolvePincodeCoordinates(dbUser.pincode);
        } catch (err) {
          console.warn(`Could not resolve user coordinates for user pincode ${dbUser.pincode}:`, err);
        }
      }
    }
    if (saved) {
      savedLawyerIds = new Set(saved.map(s => s.advocateId));
    }
  }

  // Determine reference coordinates for distance sorting
  let refCoords = null;
  if (pincode !== undefined && pincode !== null && pincode !== '') {
    refCoords = await resolvePincodeCoordinates(pincode);
  } else if (userCoords) {
    refCoords = userCoords;
  }

  // Sort by distance only if we have reference coordinates and no manual sort key is selected
  const isSortingByDefault = !sort || sort === '';
  const sortByDistance = refCoords && isSortingByDefault;

  if (sortByDistance) {
    // Get all matching advocates (without database pagination/sorting)
    const allAdvocates = await prisma.advocate.findMany({
      where,
      select: selectFields
    });

    // Calculate distance for each advocate
    const advocatesWithDistance = allAdvocates.map(adv => {
      const coords = getAdvocateCoordinates(adv);
      let distance = Infinity;
      if (coords) {
        distance = calculateHaversineDistance(
          refCoords.latitude,
          refCoords.longitude,
          coords.latitude,
          coords.longitude
        );
      }
      return { ...adv, distance };
    });

    // Sort by distance ascending
    advocatesWithDistance.sort((a, b) => a.distance - b.distance);

    // Apply pagination in memory
    const total = advocatesWithDistance.length;
    const paginated = advocatesWithDistance.slice(skip, skip + take);

    // Clean up internal coordinates/pincode fields for privacy and format distance
    const cleanAdvocates = paginated.map(adv => {
      const { pincode, latitude, longitude, ...cleanAdv } = adv;
      if (adv.distance !== Infinity) {
        cleanAdv.distance = parseFloat(adv.distance.toFixed(2));
      } else {
        cleanAdv.distance = null;
      }
      cleanAdv.isSaved = savedLawyerIds.has(adv.id);
      return cleanAdv;
    });

    return {
      advocates: cleanAdvocates,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  // 4. Default flow: Database-level pagination/sorting
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
        totalReviews: true,
        pincode: true,
        latitude: true,
        longitude: true
      }
    })
  ]);

  // Clean up coordinates and compute/attach distance if refCoords is available (e.g. user logged in but sorted by experience)
  const cleanAdvocates = advocates.map(adv => {
    const { pincode, latitude, longitude, ...cleanAdv } = adv;
    if (refCoords) {
      const coords = getAdvocateCoordinates(adv);
      if (coords) {
        const distance = calculateHaversineDistance(
          refCoords.latitude,
          refCoords.longitude,
          coords.latitude,
          coords.longitude
        );
        cleanAdv.distance = parseFloat(distance.toFixed(2));
      } else {
        cleanAdv.distance = null;
      }
    } else {
      cleanAdv.distance = null;
    }
    cleanAdv.isSaved = savedLawyerIds.has(adv.id);
    return cleanAdv;
  });

  return {
    advocates: cleanAdvocates,
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
export const getAdvocateDetailsPublic = async (id, currentUserId) => {
  const advocate = await prisma.advocate.findUnique({
    where: { id }
  });

  if (!advocate || !advocate.isActive) {
    const error = new Error('Advocate not found.');
    error.statusCode = 404;
    throw error;
  }

  // Determine if saved by current user
  let isSaved = false;
  if (currentUserId) {
    const saved = await prisma.savedLawyer.findFirst({
      where: { userId: currentUserId, advocateId: id }
    });
    isSaved = !!saved;
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
    totalReviews: advocate.totalReviews,
    isSaved
  };
};

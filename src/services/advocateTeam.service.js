import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateSecureOtp } from './otp.service.js';
import { sendOtpSms } from './sms.service.js';

/**
 * Search Advocates by Name or BAR ID
 */
export const searchAdvocates = async ({ query, barId, currentAdvocateId, page = 1, limit = 10 }) => {
  const rawQuery = query || barId;
  if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
    const error = new Error('Search query parameter is required.');
    error.statusCode = 400;
    throw error;
  }

  const cleanQuery = rawQuery.trim();
  if (cleanQuery.length > 100) {
    const error = new Error('Search query must not exceed 100 characters.');
    error.statusCode = 400;
    throw error;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const whereClause = {
    status: 'ACTIVE',
    isActive: true,
    ...(currentAdvocateId ? { id: { not: currentAdvocateId } } : {}),
    OR: [
      { barCouncilId: { equals: cleanQuery, mode: 'insensitive' } },
      { fullName: { contains: cleanQuery, mode: 'insensitive' } }
    ]
  };

  const [total, advocates] = await Promise.all([
    prisma.advocate.count({ where: whereClause }),
    prisma.advocate.findMany({
      where: whereClause,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const data = advocates.map(advocate => ({
    id: advocate.id,
    name: advocate.fullName,
    fullName: advocate.fullName,
    barId: advocate.barCouncilId,
    barCouncilId: advocate.barCouncilId,
    profileImage: advocate.profilePhotoUrl,
    profilePhotoUrl: advocate.profilePhotoUrl,
    lawType: advocate.bestPracticeArea || (advocate.practiceAreas?.[0] || null),
    bestPracticeArea: advocate.bestPracticeArea,
    city: advocate.city,
    state: advocate.state,
    pincode: advocate.pincode,
    status: advocate.status,
    experienceYears: advocate.experienceYears
  }));

  const totalPages = Math.ceil(total / limitNum) || 0;

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages
    }
  };
};

/**
 * Search Advocate by BAR ID (Legacy helper)
 */
export const searchAdvocateByBarId = async (barId, currentAdvocateId) => {
  const result = await searchAdvocates({ query: barId, currentAdvocateId, page: 1, limit: 1 });
  if (!result.data || result.data.length === 0) {
    const error = new Error('Advocate not found with the provided BAR ID.');
    error.statusCode = 404;
    throw error;
  }
  return result.data[0];
};

/**
 * Initiate Team Mate Request (Generates OTP and sends via SMS to target advocate)
 */
export const createTeamRequest = async ({ requesterId, targetAdvocateId }) => {
  // Rule 1: Cannot add self
  if (requesterId === targetAdvocateId) {
    const error = new Error('You cannot add yourself as a team mate');
    error.statusCode = 400;
    throw error;
  }

  // Rule 2: Target advocate must exist
  const targetAdvocate = await prisma.advocate.findUnique({
    where: { id: targetAdvocateId }
  });

  if (!targetAdvocate) {
    const error = new Error('Target advocate not found.');
    error.statusCode = 404;
    throw error;
  }

  // Rule 3: Target advocate must be ACTIVE
  if (!targetAdvocate.isActive || targetAdvocate.status !== 'ACTIVE') {
    const error = new Error('Target advocate is currently unavailable or blocked.');
    error.statusCode = 403;
    throw error;
  }

  // Rule 4: Prevent duplicate team relationships (canonical pair sorting)
  const canonicalPair = [requesterId, targetAdvocateId].sort();
  const existingTeamMate = await prisma.advocateTeamMate.findUnique({
    where: {
      advocateId_teamMateId: {
        advocateId: canonicalPair[0],
        teamMateId: canonicalPair[1]
      }
    }
  });

  if (existingTeamMate) {
    const error = new Error('Advocate is already in your team.');
    error.statusCode = 409;
    throw error;
  }

  // Rule 5: Prevent duplicate active pending requests
  const existingPendingRequest = await prisma.advocateTeamRequest.findFirst({
    where: {
      requesterAdvocateId: requesterId,
      targetAdvocateId,
      status: 'PENDING',
      otpExpiresAt: { gt: new Date() }
    }
  });

  if (existingPendingRequest) {
    const error = new Error('A pending team request already exists for this advocate.');
    error.statusCode = 409;
    throw error;
  }

  // Generate 6-digit OTP
  const plainOtp = generateSecureOtp();
  const otpHash = await bcrypt.hash(plainOtp, 10);

  const expiryMinutes = 5;
  const otpExpiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Cancel any old pending requests between these two advocates
  await prisma.advocateTeamRequest.updateMany({
    where: {
      requesterAdvocateId: requesterId,
      targetAdvocateId,
      status: 'PENDING'
    },
    data: { status: 'CANCELLED' }
  });

  // Create team request record
  const teamRequest = await prisma.advocateTeamRequest.create({
    data: {
      requesterAdvocateId: requesterId,
      targetAdvocateId,
      otpHash,
      otpExpiresAt,
      status: 'PENDING',
      otpAttempts: 0,
      maxOtpAttempts: 5
    }
  });

  // Send OTP SMS to Advocate B's registered mobile number
  if (targetAdvocate.phone) {
    await sendOtpSms({
      mobile: targetAdvocate.phone,
      otp: plainOtp,
      expiryMinutes
    });
  }

  const maskedPhone = targetAdvocate.phone ? `******${targetAdvocate.phone.slice(-4)}` : '******';

  return {
    requestId: teamRequest.id,
    targetAdvocateId,
    maskedPhone,
    expiresInMinutes: expiryMinutes
  };
};

/**
 * Verify Team Mate Request OTP
 */
export const verifyTeamRequest = async ({ requesterId, requestId, otp }) => {
  if (!otp || typeof otp !== 'string' || !otp.trim()) {
    const error = new Error('OTP is required.');
    error.statusCode = 400;
    throw error;
  }

  const teamRequest = await prisma.advocateTeamRequest.findUnique({
    where: { id: requestId }
  });

  if (!teamRequest) {
    const error = new Error('Team request not found.');
    error.statusCode = 404;
    throw error;
  }

  // Verify requester identity
  if (teamRequest.requesterAdvocateId !== requesterId) {
    const error = new Error('Access forbidden. You are not the requester of this team request.');
    error.statusCode = 403;
    throw error;
  }

  // Check request status
  if (teamRequest.status !== 'PENDING') {
    const error = new Error('This team request is no longer active.');
    error.statusCode = 400;
    throw error;
  }

  // Check OTP expiration
  if (teamRequest.otpExpiresAt <= new Date()) {
    await prisma.advocateTeamRequest.update({
      where: { id: requestId },
      data: { status: 'EXPIRED' }
    });
    const error = new Error('OTP has expired');
    error.statusCode = 400;
    throw error;
  }

  // Check attempt limit
  if (teamRequest.otpAttempts >= teamRequest.maxOtpAttempts) {
    await prisma.advocateTeamRequest.update({
      where: { id: requestId },
      data: { status: 'EXPIRED' }
    });
    const error = new Error('Maximum OTP verification attempts reached.');
    error.statusCode = 400;
    throw error;
  }

  // Verify OTP match
  const isMatch = await bcrypt.compare(otp.trim(), teamRequest.otpHash);

  if (!isMatch) {
    const newAttempts = teamRequest.otpAttempts + 1;
    await prisma.advocateTeamRequest.update({
      where: { id: requestId },
      data: {
        otpAttempts: newAttempts,
        ...(newAttempts >= teamRequest.maxOtpAttempts ? { status: 'EXPIRED' } : {})
      }
    });

    const error = new Error('Invalid OTP');
    error.statusCode = 400;
    throw error;
  }

  // OTP is valid -> Create mutual team mate relationship using canonical pair
  const canonicalPair = [teamRequest.requesterAdvocateId, teamRequest.targetAdvocateId].sort();

  await prisma.$transaction([
    prisma.advocateTeamRequest.update({
      where: { id: requestId },
      data: { status: 'VERIFIED' }
    }),
    prisma.advocateTeamMate.upsert({
      where: {
        advocateId_teamMateId: {
          advocateId: canonicalPair[0],
          teamMateId: canonicalPair[1]
        }
      },
      update: {},
      create: {
        advocateId: canonicalPair[0],
        teamMateId: canonicalPair[1]
      }
    })
  ]);

  return {
    requestId,
    teamMateId: teamRequest.targetAdvocateId,
    verified: true
  };
};

/**
 * Get logged-in Advocate's Team Mates
 */
export const getTeamMates = async (advocateId) => {
  const relationships = await prisma.advocateTeamMate.findMany({
    where: {
      OR: [
        { advocateId },
        { teamMateId: advocateId }
      ]
    },
    include: {
      advocate: true,
      teamMate: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return relationships
    .map(r => (r.advocateId === advocateId ? r.teamMate : r.advocate))
    .filter(target => target && target.isActive && target.status === 'ACTIVE')
    .map(target => ({
      id: target.id,
      name: target.fullName,
      fullName: target.fullName,
      barId: target.barCouncilId,
      barCouncilId: target.barCouncilId,
      profileImage: target.profilePhotoUrl,
      profilePhotoUrl: target.profilePhotoUrl,
      lawType: target.bestPracticeArea || (target.practiceAreas?.[0] || null),
      bestPracticeArea: target.bestPracticeArea,
      city: target.city,
      state: target.state,
      pincode: target.pincode,
      status: target.status
    }));
};

/**
 * Remove Team Mate
 */
export const removeTeamMate = async ({ advocateId, teamMateId }) => {
  const canonicalPair = [advocateId, teamMateId].sort();

  const existing = await prisma.advocateTeamMate.findUnique({
    where: {
      advocateId_teamMateId: {
        advocateId: canonicalPair[0],
        teamMateId: canonicalPair[1]
      }
    }
  });

  if (!existing) {
    const error = new Error('Team mate relationship not found.');
    error.statusCode = 404;
    throw error;
  }

  await prisma.advocateTeamMate.delete({
    where: {
      advocateId_teamMateId: {
        advocateId: canonicalPair[0],
        teamMateId: canonicalPair[1]
      }
    }
  });

  return { success: true };
};

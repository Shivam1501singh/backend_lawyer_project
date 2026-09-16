import prisma from '../lib/prisma.js';
import { createOtp, verifyOtp } from './otp.service.js';
import { sendOtpSms } from './sms.service.js';

/**
 * Request OTP for Advocate account deletion
 */
export const requestAdvocateDeleteAccountOtp = async ({ advocateId }) => {
  const advocate = await prisma.advocate.findUnique({
    where: { id: advocateId }
  });

  if (!advocate || !advocate.isActive) {
    const err = new Error('Advocate account not found or deactivated.');
    err.statusCode = 404;
    throw err;
  }

  if (advocate.deletionStatus === 'PENDING') {
    const err = new Error('Your account deletion request is already pending.');
    err.statusCode = 400;
    throw err;
  }

  const { plainOtp, expiryMinutes } = await createOtp({
    registrationId: null,
    accountType: 'ADVOCATE',
    purpose: 'ACCOUNT_DELETION',
    target: advocate.phone
  });

  await sendOtpSms({
    mobile: advocate.phone,
    otp: plainOtp,
    expiryMinutes
  });

  return {
    success: true,
    message: 'OTP has been sent to your registered phone number.'
  };
};

/**
 * Verify OTP for Advocate account deletion and mark deletionStatus as PENDING
 */
export const verifyAdvocateDeleteAccountOtp = async ({ advocateId, otp }) => {
  const advocate = await prisma.advocate.findUnique({
    where: { id: advocateId }
  });

  if (!advocate || !advocate.isActive) {
    const err = new Error('Advocate account not found or deactivated.');
    err.statusCode = 404;
    throw err;
  }

  if (advocate.deletionStatus === 'PENDING') {
    const err = new Error('Your account deletion request is already pending.');
    err.statusCode = 400;
    throw err;
  }

  // Verify OTP
  await verifyOtp({
    registrationId: null,
    target: advocate.phone,
    purpose: 'ACCOUNT_DELETION',
    otp
  });

  const now = new Date();
  const scheduledDeletionAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const updatedAdvocate = await prisma.advocate.update({
    where: { id: advocateId },
    data: {
      deletionStatus: 'PENDING',
      deletionRequestedAt: now,
      scheduledDeletionAt
    }
  });

  return {
    success: true,
    message: 'Your account deletion request has been submitted for admin review.',
    scheduledDeletionAt: updatedAdvocate.scheduledDeletionAt
  };
};

/**
 * Transaction-safe permanent deletion of Advocate account.
 * Moves advocate data to DeletedAdvocate table and removes original Advocate record.
 */
export const finalizeAdvocateDeletion = async (advocateId) => {
  return await prisma.$transaction(async (tx) => {
    const advocate = await tx.advocate.findUnique({
      where: { id: advocateId }
    });

    if (!advocate) {
      return null;
    }

    // Move required data into DeletedAdvocate
    const deletedRecord = await tx.deletedAdvocate.create({
      data: {
        originalAdvocateId: advocate.id,
        fullName: advocate.fullName,
        email: advocate.email,
        phone: advocate.phone,
        barCouncilId: advocate.barCouncilId,
        gender: advocate.gender,
        aadhaarNumber: advocate.aadhaarNumber,
        state: advocate.state,
        city: advocate.city,
        pincode: advocate.pincode,
        experienceYears: advocate.experienceYears,
        casesHandled: advocate.casesHandled,
        bestPracticeArea: advocate.bestPracticeArea,
        about: advocate.about,
        courtPractice: advocate.courtPractice,
        languagesSpoken: advocate.languagesSpoken,
        completeAddress: advocate.completeAddress,
        videoCallChargePerMinute: advocate.videoCallChargePerMinute,
        voiceCallChargePerMinute: advocate.voiceCallChargePerMinute,
        offlineVisitingFee: advocate.offlineVisitingFee,
        averageRating: advocate.averageRating,
        totalReviews: advocate.totalReviews,
        profileData: {
          profilePhotoUrl: advocate.profilePhotoUrl,
          phoneVerified: advocate.phoneVerified,
          emailVerified: advocate.emailVerified,
          topCourtPractised: advocate.topCourtPractised,
          practiceAreas: advocate.practiceAreas
        },
        approvalStatus: advocate.approvalStatus,
        deletionRequestedAt: advocate.deletionRequestedAt || new Date(),
        deletedAt: new Date()
      }
    });

    // Delete original Advocate record (cascades to dependent foreign key relationships)
    await tx.advocate.delete({
      where: { id: advocateId }
    });

    return deletedRecord;
  });
};

/**
 * Scheduled job logic to process all Advocate accounts whose 30-day grace period has expired.
 */
export const processExpiredAdvocateAccountDeletions = async () => {
  const expiredAdvocates = await prisma.advocate.findMany({
    where: {
      deletionStatus: 'PENDING',
      scheduledDeletionAt: {
        lte: new Date()
      }
    }
  });

  const results = [];
  for (const advocate of expiredAdvocates) {
    try {
      const res = await finalizeAdvocateDeletion(advocate.id);
      results.push(res);
    } catch (error) {
      console.error(`Error processing final deletion for advocate ${advocate.id}:`, error);
    }
  }

  return results;
};

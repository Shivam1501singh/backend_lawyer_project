import prisma from '../lib/prisma.js';
import { createOtp, verifyOtp } from './otp.service.js';
import { sendOtpSms } from './sms.service.js';

/**
 * Request OTP for account deletion
 */
export const requestDeleteAccountOtp = async ({ userId }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.isActive) {
    const err = new Error('User account not found or deactivated.');
    err.statusCode = 404;
    throw err;
  }

  if (user.status === 'DELETION_PENDING') {
    const err = new Error('Your account is already scheduled for deletion.');
    err.statusCode = 400;
    throw err;
  }

  const { plainOtp, expiryMinutes } = await createOtp({
    registrationId: null,
    accountType: 'USER',
    purpose: 'ACCOUNT_DELETION',
    target: user.phone
  });

  await sendOtpSms({
    mobile: user.phone,
    otp: plainOtp,
    expiryMinutes
  });

  return {
    success: true,
    message: 'OTP has been sent to your registered phone number.'
  };
};

/**
 * Verify OTP for account deletion and mark user status as DELETION_PENDING
 */
export const verifyDeleteAccountOtp = async ({ userId, otp }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.isActive) {
    const err = new Error('User account not found or deactivated.');
    err.statusCode = 404;
    throw err;
  }

  if (user.status === 'DELETION_PENDING') {
    const err = new Error('Your account is already scheduled for deletion.');
    err.statusCode = 400;
    throw err;
  }

  // Verify OTP
  await verifyOtp({
    registrationId: null,
    target: user.phone,
    purpose: 'ACCOUNT_DELETION',
    otp
  });

  const now = new Date();
  const scheduledDeletionAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'DELETION_PENDING',
      deletionRequestedAt: now,
      scheduledDeletionAt
    }
  });

  return {
    success: true,
    message: 'Your account is scheduled for deletion after 30 days.',
    scheduledDeletionAt: updatedUser.scheduledDeletionAt
  };
};

/**
 * Transaction-safe permanent deletion of user account.
 * Moves user data to DeletedUser table and removes the User record.
 */
export const finalizeUserDeletion = async (userId) => {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    // Move required data into DeletedUser
    const deletedRecord = await tx.deletedUser.create({
      data: {
        originalUserId: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        latitude: user.latitude,
        longitude: user.longitude,
        profileData: {
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        },
        deletionRequestedAt: user.deletionRequestedAt || new Date(),
        deletedAt: new Date()
      }
    });

    // Delete User record (cascades to related tables like Review, SavedLawyer, AdvocateLike)
    await tx.user.delete({
      where: { id: userId }
    });

    return deletedRecord;
  });
};

/**
 * Scheduled job logic to process all accounts whose 30-day grace period has expired.
 */
export const processExpiredAccountDeletions = async () => {
  const expiredUsers = await prisma.user.findMany({
    where: {
      status: 'DELETION_PENDING',
      scheduledDeletionAt: {
        lte: new Date()
      }
    }
  });

  const results = [];
  for (const user of expiredUsers) {
    try {
      const res = await finalizeUserDeletion(user.id);
      results.push(res);
    } catch (error) {
      console.error(`Error processing final deletion for user ${user.id}:`, error);
    }
  }

  return results;
};

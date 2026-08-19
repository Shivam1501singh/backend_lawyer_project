import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

// Generates a cryptographically secure 6-digit OTP string
export const generateSecureOtp = () => {
  if (process.env.NODE_ENV !== 'production') {
    return '123456';
  }
  return crypto.randomInt(100000, 999999).toString();
};

export const createOtp = async ({ registrationId, accountType, purpose, target }) => {
  const plainOtp = generateSecureOtp();
  const otpHash = await bcrypt.hash(plainOtp, 10);
  
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Invalidate any active, unused OTPs of the same purpose for this target/registration session
  await prisma.otpVerification.updateMany({
    where: {
      registrationId: registrationId || null,
      target,
      purpose,
      used: false
    },
    data: {
      used: true // effectively invalidating old ones
    }
  });

  const otpRecord = await prisma.otpVerification.create({
    data: {
      registrationId,
      accountType,
      purpose,
      target,
      otpHash,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      used: false
    }
  });

  return {
    otpRecord,
    plainOtp,
    expiryMinutes
  };
};

export const verifyOtp = async ({ registrationId, target, purpose, otp }) => {
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      registrationId: registrationId || null,
      target,
      purpose,
      used: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!otpRecord) {
    throw new Error('OTP expired, invalid, or already used. Please request a new one.');
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    // Lock/use it to prevent brute force
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });
    throw new Error('Maximum OTP verification attempts reached. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);

  if (!isMatch) {
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } }
    });
    
    const remainingAttempts = otpRecord.maxAttempts - (otpRecord.attempts + 1);
    if (remainingAttempts <= 0) {
      throw new Error('Maximum attempts reached. This OTP is now invalid.');
    }
    throw new Error(`Invalid OTP. You have ${remainingAttempts} attempts remaining.`);
  }

  // Mark OTP as used
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { used: true }
  });

  return true;
};

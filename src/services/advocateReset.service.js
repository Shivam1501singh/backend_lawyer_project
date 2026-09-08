import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateSecureOtp } from './otp.service.js';
import { sendEmailOtp } from './email.service.js';
import { sendOtpSms } from './sms.service.js';

/**
 * Request OTP for Advocate Password Reset (Email or Phone)
 */
export const requestAdvocatePasswordReset = async ({ email, phone }) => {
  const target = email ? email.toLowerCase().trim() : phone.trim();

  let advocate = null;
  if (email) {
    advocate = await prisma.advocate.findUnique({ where: { email: target } });
  } else {
    advocate = await prisma.advocate.findUnique({ where: { phone: target } });
  }

  // Account enumeration protection: Return generic message if advocate not found or inactive
  if (!advocate || !advocate.isActive) {
    return {
      success: true,
      message: 'If an advocate account exists with the provided details, an OTP has been sent.'
    };
  }

  // Invalidate previous active password reset requests for this advocate
  await prisma.advocatePasswordReset.updateMany({
    where: {
      advocateId: advocate.id,
      usedAt: null
    },
    data: {
      usedAt: new Date()
    }
  });

  // Generate 6-digit OTP & hash
  const plainOtp = generateSecureOtp();
  console.log(`[ADVOCATE RESET OTP] Target: ${target}, OTP: ${plainOtp}`);
  const otpHash = await bcrypt.hash(plainOtp, 10);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.advocatePasswordReset.create({
    data: {
      advocateId: advocate.id,
      target,
      otpHash,
      otpExpiresAt,
      maxOtpAttempts: 5,
      otpAttempts: 0,
      otpVerified: false
    }
  });

  // Send OTP to registered contact
  if (email) {
    await sendEmailOtp(advocate.email, plainOtp);
  } else {
    await sendOtpSms({
      mobile: advocate.phone,
      otp: plainOtp,
      expiryMinutes: 10
    });
  }

  return {
    success: true,
    message: 'If an advocate account exists with the provided details, an OTP has been sent.'
  };
};

/**
 * Resend OTP for Advocate Password Reset
 */
export const resendAdvocateResetOtp = async ({ email, phone }) => {
  return await requestAdvocatePasswordReset({ email, phone });
};

/**
 * Verify Advocate Password Reset OTP & return single-use resetToken
 */
export const verifyAdvocateResetOtp = async ({ email, phone, otp }) => {
  const target = email ? email.toLowerCase().trim() : phone.trim();

  let advocate = null;
  if (email) {
    advocate = await prisma.advocate.findUnique({ where: { email: target } });
  } else {
    advocate = await prisma.advocate.findUnique({ where: { phone: target } });
  }

  if (!advocate || !advocate.isActive) {
    throw new Error('OTP expired, invalid, or advocate account not found.');
  }

  // Find latest active reset request for this advocate
  const resetRecord = await prisma.advocatePasswordReset.findFirst({
    where: {
      advocateId: advocate.id,
      usedAt: null,
      otpVerified: false,
      otpExpiresAt: { gt: new Date() }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!resetRecord) {
    throw new Error('OTP expired, invalid, or already used. Please request a new one.');
  }

  if (resetRecord.otpAttempts >= resetRecord.maxOtpAttempts) {
    await prisma.advocatePasswordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() }
    });
    throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, resetRecord.otpHash);

  if (!isMatch) {
    const updatedAttempts = resetRecord.otpAttempts + 1;
    const remainingAttempts = resetRecord.maxOtpAttempts - updatedAttempts;

    if (remainingAttempts <= 0) {
      await prisma.advocatePasswordReset.update({
        where: { id: resetRecord.id },
        data: { otpAttempts: updatedAttempts, usedAt: new Date() }
      });
      throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
    } else {
      await prisma.advocatePasswordReset.update({
        where: { id: resetRecord.id },
        data: { otpAttempts: updatedAttempts }
      });
      throw new Error(`Invalid OTP. You have ${remainingAttempts} attempts remaining.`);
    }
  }

  // Generate cryptographically secure reset token (hex)
  const plainResetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(plainResetToken).digest('hex');
  const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.advocatePasswordReset.update({
    where: { id: resetRecord.id },
    data: {
      otpVerified: true,
      otpVerifiedAt: new Date(),
      resetTokenHash,
      resetTokenExpiresAt
    }
  });

  return {
    success: true,
    message: 'OTP verified successfully',
    resetToken: plainResetToken
  };
};

/**
 * Reset Advocate Password using Reset Token
 */
export const resetAdvocatePassword = async ({ resetToken, newPassword }) => {
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  const resetRecord = await prisma.advocatePasswordReset.findFirst({
    where: {
      resetTokenHash: tokenHash,
      usedAt: null,
      otpVerified: true,
      resetTokenExpiresAt: { gt: new Date() }
    }
  });

  if (!resetRecord) {
    throw new Error('Invalid or expired password reset token. Please restart the password reset process.');
  }

  const advocate = await prisma.advocate.findUnique({
    where: { id: resetRecord.advocateId }
  });

  if (!advocate || !advocate.isActive) {
    throw new Error('Advocate account not found or deactivated.');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password & invalidate all reset tokens for this advocate
  await prisma.$transaction([
    prisma.advocate.update({
      where: { id: advocate.id },
      data: { passwordHash }
    }),
    prisma.advocatePasswordReset.updateMany({
      where: { advocateId: advocate.id },
      data: { usedAt: new Date() }
    })
  ]);

  return {
    success: true,
    message: 'Password reset successfully. You can now login with your new password.'
  };
};

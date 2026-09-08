import * as advocateResetValidator from '../validators/advocateReset.validator.js';
import * as advocateResetService from '../services/advocateReset.service.js';

/**
 * Advocate Request Password Reset OTP
 * POST /api/advocate/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const validated = advocateResetValidator.forgotPasswordSchema.parse(req.body);
    const result = await advocateResetService.requestAdvocatePasswordReset(validated);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Advocate Resend Password Reset OTP
 * POST /api/advocate/resend-reset-otp
 */
export const resendResetOtp = async (req, res, next) => {
  try {
    const validated = advocateResetValidator.forgotPasswordSchema.parse(req.body);
    const result = await advocateResetService.resendAdvocateResetOtp(validated);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Advocate Verify Password Reset OTP
 * POST /api/advocate/verify-reset-otp
 */
export const verifyResetOtp = async (req, res, next) => {
  try {
    const validated = advocateResetValidator.verifyResetOtpSchema.parse(req.body);
    const result = await advocateResetService.verifyAdvocateResetOtp(validated);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Advocate Reset Password
 * POST /api/advocate/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const validated = advocateResetValidator.resetPasswordSchema.parse(req.body);
    const result = await advocateResetService.resetAdvocatePassword(validated);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

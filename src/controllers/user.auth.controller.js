import * as authService from '../services/auth.service.js';
import * as userValidator from '../validators/user.validator.js';
import { signToken, sendTokenCookie, clearTokenCookie } from '../utils/jwt.js';

export const startRegistration = async (req, res, next) => {
  try {
    const validated = userValidator.startRegistrationSchema.parse(req.body);
    const normalizedEmail = validated.email.toLowerCase().trim();

    // Check email duplicates in both tables
    await authService.checkDuplicateEmail(normalizedEmail);
    
    const session = await authService.startRegistration({
      fullName: validated.fullName,
      email: normalizedEmail,
      accountType: 'USER',
      registrationId: validated.registrationId
    });

    // Send the verification OTP
    await authService.sendEmailOtpForRegistration({
      registrationId: session.id,
      email: normalizedEmail
    });

    return res.status(201).json({
      success: true,
      message: 'Verification OTP sent to your email.',
      registrationId: session.id,
      email: normalizedEmail
    });
  } catch (error) {
    next(error);
  }
};

export const sendEmailOtp = async (req, res, next) => {
  try {
    const validated = userValidator.sendEmailOtpSchema.parse(req.body);
    
    await authService.sendEmailOtpForRegistration({
      registrationId: validated.registrationId,
      email: validated.email
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email address successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailOtp = async (req, res, next) => {
  try {
    const validated = userValidator.verifyEmailOtpSchema.parse(req.body);

    await authService.verifyEmailOtpForRegistration({
      registrationId: validated.registrationId,
      otp: validated.otp
    });

    const session = await authService.getCurrentRegistrationSession(validated.registrationId);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      registrationId: validated.registrationId,
      registration: {
        fullName: session.fullName,
        email: session.email,
        emailVerified: session.emailVerified
      },
      nextStep: 2
    });
  } catch (error) {
    next(error);
  }
};

export const getRegistrationSession = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const session = await authService.getCurrentRegistrationSession(registrationId);
    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    next(error);
  }
};

export const completeProfile = async (req, res, next) => {
  try {
    const validated = userValidator.completeProfileSchema.parse(req.body);

    await authService.completeProfileForRegistration({
      registrationId: validated.registrationId,
      city: validated.city,
      state: validated.state,
      pincode: validated.pincode,
      latitude: validated.latitude,
      longitude: validated.longitude
    });

    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const sendPhoneOtp = async (req, res, next) => {
  try {
    const validated = userValidator.sendPhoneOtpSchema.parse(req.body);

    await authService.sendPhoneOtpForRegistration({
      registrationId: validated.registrationId,
      phone: validated.phone
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPhone = async (req, res, next) => {
  try {
    const validated = userValidator.verifyPhoneSchema.parse(req.body);

    await authService.verifyPhoneOtpForRegistration({
      registrationId: validated.registrationId,
      otp: validated.otp
    });

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      phoneVerified: true
    });
  } catch (error) {
    next(error);
  }
};

export const loginSendOtp = async (req, res, next) => {
  try {
    const validated = userValidator.loginSendOtpSchema.parse(req.body);

    await authService.sendLoginOtpService({
      phone: validated.phone,
      accountType: 'USER'
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const loginVerifyOtp = async (req, res, next) => {
  try {
    const validated = userValidator.loginVerifyOtpSchema.parse(req.body);

    const user = await authService.verifyLoginOtpService({
      phone: validated.phone,
      accountType: 'USER',
      otp: validated.otp
    });

    const token = signToken({ id: user.id, type: 'user' });
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

export const loginSendEmailOtp = async (req, res, next) => {
  try {
    const validated = userValidator.loginSendEmailOtpSchema.parse(req.body);

    await authService.sendLoginEmailOtpService({
      email: validated.email,
      accountType: 'USER'
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const loginVerifyEmailOtp = async (req, res, next) => {
  try {
    const validated = userValidator.loginVerifyEmailOtpSchema.parse(req.body);

    const user = await authService.verifyLoginEmailOtpService({
      email: validated.email,
      accountType: 'USER',
      otp: validated.otp
    });

    const token = signToken({ id: user.id, type: 'user' });
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

// Common/Shared: Current User profile
export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user has already been resolved and populated by requireAuth middleware
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Common/Shared: Logout
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

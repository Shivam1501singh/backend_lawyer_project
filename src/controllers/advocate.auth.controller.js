import * as authService from '../services/auth.service.js';
import * as advocateValidator from '../validators/advocate.validator.js';
import { signToken, sendTokenCookie } from '../utils/jwt.js';
import { uploadBufferToCloudinary } from '../services/cloudinary.service.js';
import bcrypt from 'bcryptjs';

export const startRegistration = async (req, res, next) => {
  try {
    const validated = advocateValidator.startAdvocateRegistrationSchema.parse(req.body);
    const normalizedEmail = validated.email.toLowerCase().trim();

    // Check duplicate email
    await authService.checkDuplicateEmail(normalizedEmail);
    
    const session = await authService.startRegistration({
      fullName: validated.fullName,
      email: normalizedEmail,
      profilePhotoUrl: validated.profilePhotoUrl,
      profilePhotoPublicId: validated.profilePhotoPublicId,
      gender: validated.gender,
      accountType: 'ADVOCATE',
      registrationId: validated.registrationId
    });

    // Send the verification OTP if email is not verified yet
    if (!session.emailVerified) {
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
    }

    return res.status(200).json({
      success: true,
      registrationId: session.id
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

export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Accept common image formats: JPEG, JPG, PNG, WEBP
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only JPEG, JPG, PNG, and WEBP images are allowed.'
      });
    }

    // Set maximum size to 5MB
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 5MB limit.'
      });
    }

    const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer);

    return res.status(200).json({
      success: true,
      profilePhotoUrl: url,
      profilePhotoPublicId: publicId
    });
  } catch (error) {
    next(error);
  }
};

export const sendEmailOtp = async (req, res, next) => {
  try {
    const validated = advocateValidator.sendAdvocateEmailOtpSchema.parse(req.body);
    
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
    const validated = advocateValidator.verifyAdvocateEmailOtpSchema.parse(req.body);

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

export const completeProfile = async (req, res, next) => {
  try {
    const validated = advocateValidator.completeAdvocateRegistrationSchema.parse(req.body);

    const advocate = await authService.completeAdvocateRegistration({
      registrationId: validated.registrationId,
      barCouncilId: validated.barCouncilId,
      aadhaarNumber: validated.aadhaarNumber,
      password: validated.password,
      languagesSpoken: validated.languagesSpoken,
      state: validated.state,
      city: validated.city,
      pincode: validated.pincode,
      latitude: validated.latitude,
      longitude: validated.longitude
    });

    return res.status(200).json({
      success: true,
      message: 'Registration completed successfully.',
      advocateId: advocate.id
    });
  } catch (error) {
    next(error);
  }
};

export const sendPhoneOtp = async (req, res, next) => {
  try {
    const validated = advocateValidator.sendAdvocatePhoneOtpSchema.parse(req.body);

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
    const validated = advocateValidator.verifyAdvocatePhoneSchema.parse(req.body);

    await authService.verifyPhoneOtpForRegistration({
      registrationId: validated.registrationId,
      otp: validated.otp
    });

    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const loginSendOtp = async (req, res, next) => {
  try {
    const validated = advocateValidator.advocateLoginSendOtpSchema.parse(req.body);

    await authService.sendLoginOtpService({
      phone: validated.phone,
      accountType: 'ADVOCATE'
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
    const validated = advocateValidator.advocateLoginVerifyOtpSchema.parse(req.body);

    const advocate = await authService.verifyLoginOtpService({
      phone: validated.phone,
      accountType: 'ADVOCATE',
      otp: validated.otp
    });

    const token = signToken({ id: advocate.id, type: 'advocate' });
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    next(error);
  }
};

export const loginEmailPassword = async (req, res, next) => {
  try {
    const validated = advocateValidator.advocateLoginEmailPasswordSchema.parse(req.body);

    const advocate = await authService.verifyEmailPasswordLoginService({
      email: validated.email,
      password: validated.password
    });

    const token = signToken({ id: advocate.id, type: 'advocate' });
    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    // If it's a validation error, let next(error) handle it
    if (error.name === 'ZodError') {
      return next(error);
    }
    // Return generic message for any authentication failures
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
};

export const initiateAadhaar = async (req, res, next) => {
  try {
    const validated = advocateValidator.initiateAadhaarSchema.parse(req.body);

    const result = await authService.initiateAadhaarVerificationService({
      registrationId: validated.registrationId,
      aadhaarNumber: validated.aadhaarNumber
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        remainingAttempts: error.remainingAttempts,
        blocked: error.blocked,
        blockedUntil: error.blockedUntil
      });
    }
    next(error);
  }
};

export const verifyAadhaar = async (req, res, next) => {
  try {
    const validated = advocateValidator.verifyAadhaarSchema.parse(req.body);

    const result = await authService.verifyAadhaarStatusService({
      registrationId: validated.registrationId,
      clientId: validated.clientId
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        remainingAttempts: error.remainingAttempts,
        blocked: error.blocked,
        blockedUntil: error.blockedUntil
      });
    }
    next(error);
  }
};

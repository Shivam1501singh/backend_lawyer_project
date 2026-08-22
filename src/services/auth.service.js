import prisma from '../lib/prisma.js';
import { createOtp, verifyOtp } from './otp.service.js';
import { sendEmailOtp } from './email.service.js';
import { sendOtpSms } from './sms.service.js';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/crypto.js';
import { initiateAadhaarDigiLocker, fetchAadhaarDetails } from './idspay.service.js';

// Helper to check duplicates in both tables
export const checkDuplicateEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const existingAdvocate = await prisma.advocate.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    throw new Error('An account with this email already exists as a User.');
  }
  if (existingAdvocate) {
    throw new Error('An account with this email already exists as an Advocate.');
  }
};

export const checkDuplicatePhone = async (phone) => {
  const cleanPhone = phone.trim();
  const existingUser = await prisma.user.findUnique({ where: { phone: cleanPhone } });
  const existingAdvocate = await prisma.advocate.findUnique({ where: { phone: cleanPhone } });

  if (existingUser) {
    throw new Error('An account with this phone number already exists as a User.');
  }
  if (existingAdvocate) {
    throw new Error('An account with this phone number already exists as an Advocate.');
  }
};

export const checkDuplicateBarCouncilId = async (barCouncilId) => {
  const cleanId = barCouncilId.trim();
  const existingAdvocate = await prisma.advocate.findUnique({ where: { barCouncilId: cleanId } });
  if (existingAdvocate) {
    throw new Error('An account with this Bar Council ID already exists.');
  }
};

// 1. Start Registration Session
export const startRegistration = async ({ fullName, email, emailVerified, accountType, profilePhotoUrl, profilePhotoPublicId, gender, registrationId }) => {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
  
  if (registrationId) {
    return await prisma.registrationSession.update({
      where: { id: registrationId },
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        emailVerified: emailVerified !== undefined ? emailVerified : undefined,
        profilePhotoUrl,
        profilePhotoPublicId,
        gender,
        expiresAt
      }
    });
  }

  return await prisma.registrationSession.create({
    data: {
      fullName: fullName.trim(),
      email: normalizedEmail,
      emailVerified: emailVerified !== undefined ? emailVerified : false,
      accountType,
      expiresAt,
      profilePhotoUrl,
      profilePhotoPublicId,
      gender
    }
  });
};

// Get Session Helper
const getValidSession = async (registrationId) => {
  const session = await prisma.registrationSession.findUnique({
    where: { id: registrationId }
  });

  if (!session) {
    throw new Error('Registration session not found. Please start again.');
  }

  if (new Date() > new Date(session.expiresAt)) {
    // Delete expired session
    await prisma.registrationSession.delete({ where: { id: registrationId } }).catch(() => {});
    throw new Error('Registration session has expired. Please start again.');
  }

  return session;
};

export const getCurrentRegistrationSession = async (registrationId) => {
  const session = await getValidSession(registrationId);
  return {
    id: session.id,
    fullName: session.fullName,
    email: session.email,
    emailVerified: session.emailVerified,
    phone: session.phone,
    phoneVerified: session.phoneVerified,
    profilePhotoUrl: session.profilePhotoUrl,
    profilePhotoPublicId: session.profilePhotoPublicId,
    gender: session.gender,
    accountType: session.accountType,
    aadhaarVerified: session.aadhaarVerified,
    aadhaarVerificationAttempts: session.aadhaarVerificationAttempts,
    aadhaarBlockedUntil: session.aadhaarBlockedUntil,
    aadhaarVerificationId: session.aadhaarVerificationId,
    aadhaarVerifiedAt: session.aadhaarVerifiedAt,
    aadhaarNumber: session.aadhaarNumber ? decrypt(session.aadhaarNumber) : null
  };
};

// 2. Send Email OTP
export const sendEmailOtpForRegistration = async ({ registrationId, email }) => {
  const session = await getValidSession(registrationId);
  const normalizedEmail = email.toLowerCase().trim();

  // Check email duplicates in both tables
  await checkDuplicateEmail(normalizedEmail);

  // Generate & save Email OTP
  const { plainOtp } = await createOtp({
    registrationId,
    accountType: session.accountType,
    purpose: 'EMAIL_VERIFICATION',
    target: normalizedEmail
  });

  // Update session email
  await prisma.registrationSession.update({
    where: { id: registrationId },
    data: { email: normalizedEmail }
  });

  // Send the OTP
  await sendEmailOtp(normalizedEmail, plainOtp);
  return true;
};

// 3. Verify Email OTP
export const verifyEmailOtpForRegistration = async ({ registrationId, otp }) => {
  const session = await getValidSession(registrationId);
  if (!session.email) {
    throw new Error('No email associated with this session.');
  }

  await verifyOtp({
    registrationId,
    target: session.email,
    purpose: 'EMAIL_VERIFICATION',
    otp
  });

  await prisma.registrationSession.update({
    where: { id: registrationId },
    data: { emailVerified: true }
  });

  return true;
};

// 4. Complete Profile Details (Used for USER flow)
export const completeProfileForRegistration = async ({ registrationId, city, state, pincode, latitude, longitude }) => {
  const session = await getValidSession(registrationId);

  if (!session.emailVerified) {
    throw new Error('Please verify your email address before completing your profile.');
  }

  if (!session.phoneVerified || !session.phone) {
    throw new Error('Please verify your phone number before adding your address.');
  }

  return await prisma.$transaction(async (tx) => {
    const normalizedEmail = session.email.toLowerCase().trim();
    const cleanPhone = session.phone.trim();

    const emailUser = await tx.user.findUnique({ where: { email: normalizedEmail } });
    const emailAdv = await tx.advocate.findUnique({ where: { email: normalizedEmail } });
    if (emailUser || emailAdv) {
      throw new Error('An account with this email was registered in another session.');
    }

    const phoneUser = await tx.user.findUnique({ where: { phone: cleanPhone } });
    const phoneAdv = await tx.advocate.findUnique({ where: { phone: cleanPhone } });
    if (phoneUser || phoneAdv) {
      throw new Error('An account with this phone number was registered in another session.');
    }

    const createdAccount = await tx.user.create({
      data: {
        fullName: session.fullName,
        email: normalizedEmail,
        phone: cleanPhone,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
        longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null
      }
    });

    // Delete registration session (cascade deletes OTP records associated with it)
    await tx.registrationSession.delete({
      where: { id: session.id }
    });

    return createdAccount;
  });
};

// 5. Send Phone OTP
export const sendPhoneOtpForRegistration = async ({ registrationId, phone }) => {
  const session = await getValidSession(registrationId);

  if (!session.emailVerified) {
    throw new Error('Email must be verified first.');
  }

  const cleanPhone = phone ? phone.trim() : session.phone;
  if (!cleanPhone) {
    throw new Error('Phone number is missing.');
  }

  await checkDuplicatePhone(cleanPhone);

  // If a phone is provided explicitly, update it in session
  if (phone) {
    await prisma.registrationSession.update({
      where: { id: registrationId },
      data: { phone: cleanPhone }
    });
  }

  const { plainOtp, expiryMinutes } = await createOtp({
    registrationId,
    accountType: session.accountType,
    purpose: 'PHONE_VERIFICATION',
    target: cleanPhone
  });

  await sendOtpSms({
    mobile: cleanPhone,
    otp: plainOtp,
    expiryMinutes
  });

  return true;
};

// 6. Verify Phone OTP
export const verifyPhoneOtpForRegistration = async ({ registrationId, otp }) => {
  const session = await getValidSession(registrationId);

  if (!session.emailVerified) {
    throw new Error('Email must be verified.');
  }
  if (!session.phone) {
    throw new Error('Phone number is missing.');
  }

  // Verify OTP
  await verifyOtp({
    registrationId,
    target: session.phone,
    purpose: 'PHONE_VERIFICATION',
    otp
  });

  // Mark phone as verified in registration session
  await prisma.registrationSession.update({
    where: { id: registrationId },
    data: { phoneVerified: true }
  });

  return true;
};

// 6b. Finalize Advocate Registration
export const completeAdvocateRegistration = async ({
  registrationId,
  barCouncilId,
  aadhaarNumber,
  password,
  languagesSpoken,
  state,
  city,
  pincode,
  latitude,
  longitude
}) => {
  const session = await getValidSession(registrationId);

  if (session.accountType !== 'ADVOCATE') {
    throw new Error('Invalid account type for this operation.');
  }

  if (!session.emailVerified) {
    throw new Error('Email must be verified.');
  }

  if (!session.phoneVerified) {
    throw new Error('Phone must be verified.');
  }

  if (!session.profilePhotoUrl) {
    throw new Error('Profile photo must be uploaded.');
  }

  if (!session.aadhaarVerified) {
    throw new Error('Aadhaar verification is required to complete profile.');
  }

  const cleanBarCouncilId = barCouncilId.trim();
  const cleanAadhaar = aadhaarNumber.replace(/\s/g, ''); // Strip spaces

  // Check unique constraints
  await checkDuplicateBarCouncilId(cleanBarCouncilId);
  const normalizedEmail = session.email.toLowerCase().trim();
  const cleanPhone = session.phone.trim();
  await checkDuplicateEmail(normalizedEmail);
  await checkDuplicatePhone(cleanPhone);

  // Hash password & encrypt Aadhaar
  const passwordHash = await bcrypt.hash(password, 10);
  const encryptedAadhaar = encrypt(cleanAadhaar);

  // Create Advocate and delete session in transaction
  return await prisma.$transaction(async (tx) => {
    // Check duplicates again to prevent race conditions
    const emailUser = await tx.user.findUnique({ where: { email: normalizedEmail } });
    const emailAdv = await tx.advocate.findUnique({ where: { email: normalizedEmail } });
    if (emailUser || emailAdv) {
      throw new Error('An account with this email was registered in another session.');
    }

    const phoneUser = await tx.user.findUnique({ where: { phone: cleanPhone } });
    const phoneAdv = await tx.advocate.findUnique({ where: { phone: cleanPhone } });
    if (phoneUser || phoneAdv) {
      throw new Error('An account with this phone number was registered in another session.');
    }

    const barAdv = await tx.advocate.findUnique({ where: { barCouncilId: cleanBarCouncilId } });
    if (barAdv) {
      throw new Error('Bar Council ID already registered.');
    }

    const createdAdvocate = await tx.advocate.create({
      data: {
        fullName: session.fullName,
        email: normalizedEmail,
        phone: cleanPhone,
        profilePhotoUrl: session.profilePhotoUrl,
        profilePhotoPublicId: session.profilePhotoPublicId,
        gender: session.gender,
        barCouncilId: cleanBarCouncilId,
        aadhaarNumber: encryptedAadhaar,
        passwordHash,
        languagesSpoken,
        state: state.trim(),
        city: city.trim(),
        pincode: pincode ? pincode.trim() : null,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        latitude: latitude !== undefined && latitude !== null ? parseFloat(latitude) : null,
        longitude: longitude !== undefined && longitude !== null ? parseFloat(longitude) : null,
        aadhaarVerified: session.aadhaarVerified,
        aadhaarVerificationId: session.aadhaarVerificationId,
        aadhaarVerifiedAt: session.aadhaarVerifiedAt,
        aadhaarVerificationAttempts: session.aadhaarVerificationAttempts,
        aadhaarBlockedUntil: session.aadhaarBlockedUntil
      }
    });

    // Delete registration session
    await tx.registrationSession.delete({
      where: { id: session.id }
    });

    return createdAdvocate;
  });
};


// 7. Login: Send Phone OTP
export const sendLoginOtpService = async ({ phone, accountType }) => {
  const cleanPhone = phone.trim();
  let account;

  if (accountType === 'USER') {
    account = await prisma.user.findUnique({ where: { phone: cleanPhone } });
  } else {
    account = await prisma.advocate.findUnique({ where: { phone: cleanPhone } });
  }

  if (!account) {
    throw new Error('Account not found. Please create an account first.');
  }

  if (!account.isActive) {
    throw new Error('Your account is deactivated. Please contact support.');
  }

  // Generate & save login OTP
  const { plainOtp, expiryMinutes } = await createOtp({
    registrationId: null,
    accountType,
    purpose: 'LOGIN',
    target: cleanPhone
  });

  await sendOtpSms({
    mobile: cleanPhone,
    otp: plainOtp,
    expiryMinutes
  });

  return true;
};

// 8. Login: Verify OTP
export const verifyLoginOtpService = async ({ phone, accountType, otp }) => {
  const cleanPhone = phone.trim();
  let account;

  if (accountType === 'USER') {
    account = await prisma.user.findUnique({ where: { phone: cleanPhone } });
  } else {
    account = await prisma.advocate.findUnique({ where: { phone: cleanPhone } });
  }

  if (!account) {
    throw new Error('Account not found.');
  }

  if (!account.isActive) {
    throw new Error('Account is deactivated.');
  }

  await verifyOtp({
    registrationId: null,
    target: cleanPhone,
    purpose: 'LOGIN',
    otp
  });

  return account;
};

// 8b. Login: Send Email OTP
export const sendLoginEmailOtpService = async ({ email, accountType }) => {
  const normalizedEmail = email.toLowerCase().trim();
  let account;

  if (accountType === 'USER') {
    account = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  } else {
    account = await prisma.advocate.findUnique({ where: { email: normalizedEmail } });
  }

  if (!account) {
    if (accountType === 'USER') {
      throw new Error('Account not found. Please create an account first.');
    } else {
      throw new Error('Account not found. Please create an advocate account first.');
    }
  }

  if (!account.isActive) {
    throw new Error('Account is not active. Please complete registration.');
  }

  // Generate & save login Email OTP
  const { plainOtp } = await createOtp({
    registrationId: null,
    accountType,
    purpose: 'LOGIN',
    target: normalizedEmail
  });

  await sendEmailOtp(normalizedEmail, plainOtp);
  return true;
};

// 8c. Login: Verify Email OTP
export const verifyLoginEmailOtpService = async ({ email, accountType, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();
  let account;

  if (accountType === 'USER') {
    account = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  } else {
    account = await prisma.advocate.findUnique({ where: { email: normalizedEmail } });
  }

  if (!account) {
    throw new Error('Account not found.');
  }

  if (!account.isActive) {
    throw new Error('Account is deactivated.');
  }

  await verifyOtp({
    registrationId: null,
    target: normalizedEmail,
    purpose: 'LOGIN',
    otp
  });

  return account;
};

// 8d. Login: Verify Advocate Email & Password
export const verifyEmailPasswordLoginService = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const advocate = await prisma.advocate.findUnique({
    where: { email: normalizedEmail }
  });

  if (!advocate) {
    throw new Error('Invalid email or password');
  }

  if (!advocate.isActive) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, advocate.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return advocate;
};

// 9. Get Current User profile
export const getCurrentUserProfile = async (id, accountType) => {
  let profile = null;
  if (accountType === 'user') {
    profile = await prisma.user.findUnique({ where: { id } });
  } else if (accountType === 'advocate') {
    profile = await prisma.advocate.findUnique({
      where: { id }
    });
  }

  if (!profile || !profile.isActive) {
    return null;
  }

  if (accountType === 'user') {
    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      type: accountType
    };
  } else {
    return {
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      profilePhotoUrl: profile.profilePhotoUrl,
      gender: profile.gender,
      barCouncilId: profile.barCouncilId,
      languagesSpoken: profile.languagesSpoken,
      state: profile.state,
      city: profile.city,
      pincode: profile.pincode,
      type: accountType,
      experienceYears: profile.experienceYears,
      casesWon: profile.casesWon,
      practiceAreas: profile.practiceAreas,
      topCourtPractised: profile.topCourtPractised,
      bestPracticeArea: profile.bestPracticeArea,
      about: profile.about,
      courtPractice: profile.courtPractice,
      completeAddress: profile.completeAddress,
      videoCallChargePerMinute: profile.videoCallChargePerMinute !== null ? Number(profile.videoCallChargePerMinute) : null,
      voiceCallChargePerMinute: profile.voiceCallChargePerMinute !== null ? Number(profile.voiceCallChargePerMinute) : null,
      offlineVisitingFee: profile.offlineVisitingFee !== null ? Number(profile.offlineVisitingFee) : null
    };
  }
};

// Aadhaar Initiate Verification service
export const initiateAadhaarVerificationService = async ({ registrationId, aadhaarNumber }) => {
  const session = await getValidSession(registrationId);

  if (session.accountType !== 'ADVOCATE') {
    const err = new Error('Invalid account type for this operation.');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();

  // Check if currently blocked
  if (session.aadhaarBlockedUntil && now < new Date(session.aadhaarBlockedUntil)) {
    const err = new Error('Aadhaar verification is temporarily blocked. Please try again after 24 hours.');
    err.statusCode = 403;
    err.blocked = true;
    err.blockedUntil = session.aadhaarBlockedUntil;
    throw err;
  }

  // Lazy unblock if 24 hours have passed
  if (session.aadhaarBlockedUntil && now >= new Date(session.aadhaarBlockedUntil)) {
    await prisma.registrationSession.update({
      where: { id: registrationId },
      data: {
        aadhaarVerificationAttempts: 0,
        aadhaarBlockedUntil: null
      }
    });
    session.aadhaarVerificationAttempts = 0;
    session.aadhaarBlockedUntil = null;
  }

  // Check if already verified
  if (session.aadhaarVerified) {
    return {
      success: true,
      aadhaarVerified: true,
      message: 'Aadhaar already verified.'
    };
  }

  // Validate format
  const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    // Malformed input: count it as a failed attempt to prevent bypass
    const newAttempts = session.aadhaarVerificationAttempts + 1;
    const isBlocked = newAttempts >= 3;
    const blockedUntil = isBlocked ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null;

    await prisma.registrationSession.update({
      where: { id: registrationId },
      data: {
        aadhaarVerificationAttempts: newAttempts,
        aadhaarBlockedUntil: blockedUntil
      }
    });

    const err = new Error('Aadhaar number must be exactly 12 digits.');
    err.statusCode = 400;
    err.remainingAttempts = Math.max(0, 3 - newAttempts);
    err.blocked = isBlocked;
    err.blockedUntil = blockedUntil;
    throw err;
  }

  // Call IDSPay initiation
  const response = await initiateAadhaarDigiLocker(cleanAadhaar, registrationId);

  const statusType = response && typeof response.status === 'object' ? response.status?.type : response?.status;
  const isInitiateSuccess = response && 
                            (String(statusType || '').toLowerCase() === 'success' || response.status?.code === 200) && 
                            response.data && 
                            response.data.client_id;

  if (isInitiateSuccess) {
    // Save to session database
    await prisma.registrationSession.update({
      where: { id: registrationId },
      data: {
        aadhaarNumber: encrypt(cleanAadhaar),
        aadhaarVerificationId: response.data.client_id
      }
    });

    return {
      success: true,
      clientId: response.data.client_id,
      url: response.data.url
    };
  } else {
    // Technical failure - do NOT count as a failed attempt
    const errorMsg = (typeof response?.status === 'object' ? response?.status?.message : null) || response?.message || 'Failed to initiate DigiLocker verification with provider.';
    const err = new Error(errorMsg);
    err.statusCode = 502;
    throw err;
  }
};

// Aadhaar Verify Status service
export const verifyAadhaarStatusService = async ({ registrationId, clientId }) => {
  const session = await getValidSession(registrationId);

  if (session.accountType !== 'ADVOCATE') {
    const err = new Error('Invalid account type for this operation.');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();

  // Check if currently blocked
  if (session.aadhaarBlockedUntil && now < new Date(session.aadhaarBlockedUntil)) {
    const err = new Error('Aadhaar verification is temporarily blocked. Please try again after 24 hours.');
    err.statusCode = 403;
    err.blocked = true;
    err.blockedUntil = session.aadhaarBlockedUntil;
    throw err;
  }

  // Call IDSPay status check
  const response = await fetchAadhaarDetails(clientId);

  const statusType = response && typeof response.status === 'object' ? response.status?.type : response?.status;
  const statusStr = String(statusType || '').toLowerCase();
  const statusCode = response?.status?.code;
  const dataStatus = response?.data ? String(response.data.status || response.data.verification_status || '').toLowerCase() : '';

  const isSuccess = (statusStr === 'success' || statusCode === 200) && 
                     (dataStatus === 'success' || dataStatus === 'success_verified' || dataStatus === 'verified' || dataStatus === 'completed' || dataStatus === 'success_kyc' || dataStatus === 'approved' || dataStatus === '');

  if (isSuccess) {
    await prisma.registrationSession.update({
      where: { id: registrationId },
      data: {
        aadhaarVerified: true,
        aadhaarVerificationId: clientId,
        aadhaarVerifiedAt: now,
        aadhaarVerificationAttempts: 0,
        aadhaarBlockedUntil: null
      }
    });

    return {
      success: true,
      aadhaarVerified: true,
      message: 'Aadhaar verified successfully.'
    };
  } else {
    // Update attempts
    const newAttempts = session.aadhaarVerificationAttempts + 1;
    const isBlocked = newAttempts >= 3;
    const blockedUntil = isBlocked ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null;

    await prisma.registrationSession.update({
      where: { id: registrationId },
      data: {
        aadhaarVerified: false,
        aadhaarVerifiedAt: null,
        aadhaarVerificationAttempts: newAttempts,
        aadhaarBlockedUntil: blockedUntil
      }
    });

    const errorMsg = (typeof response?.status === 'object' ? response?.status?.message : null) || response?.message || 'Aadhaar verification failed.';
    const err = new Error(errorMsg);
    err.statusCode = 400;
    err.remainingAttempts = Math.max(0, 3 - newAttempts);
    err.blocked = isBlocked;
    err.blockedUntil = blockedUntil;
    throw err;
  }
};

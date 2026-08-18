import prisma from '../lib/prisma.js';
import { createOtp, verifyOtp } from './otp.service.js';
import { sendEmailOtp } from './email.service.js';
import { sendOtpSms } from './sms.service.js';
import bcrypt from 'bcryptjs';
import { encrypt } from '../utils/crypto.js';

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
    accountType: session.accountType
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
export const completeProfileForRegistration = async ({ registrationId, city, state, pincode, phone }) => {
  const session = await getValidSession(registrationId);

  if (!session.emailVerified) {
    throw new Error('Please verify your email address before completing your profile.');
  }

  const cleanPhone = phone.trim();

  // Check duplicate phone
  await checkDuplicatePhone(cleanPhone);

  await prisma.registrationSession.update({
    where: { id: registrationId },
    data: {
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      phone: cleanPhone
    }
  });

  return true;
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

  // If a phone is provided explicitly (e.g. in Advocate flow), update it in session
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

// 6. Verify Phone OTP (and auto-finalize for USER only)
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

  // Finalize auto-creation ONLY if USER. Advocate requires final step.
  if (session.accountType === 'USER') {
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
          city: session.city,
          state: session.state,
          pincode: session.pincode,
          emailVerified: true,
          phoneVerified: true,
          isActive: true
        }
      });

      // Delete registration session (cascade deletes OTP records associated with it)
      await tx.registrationSession.delete({
        where: { id: session.id }
      });

      return createdAccount;
    });
  }

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
  pincode
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
        isActive: true
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

import prisma from '../lib/prisma.js';
import { startRegistration } from '../services/auth.service.js';
import { signToken, sendTokenCookie } from '../utils/jwt.js';

export const googleCallbackHandler = (accountType) => {
  return async (req, res, next) => {
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const redirectType = accountType.toLowerCase();

      // If user profile is not supplied by Passport
      if (!req.user) {
        return res.redirect(`${clientUrl}/login/${redirectType}?error=google_auth_failed`);
      }

      const { fullName, email } = req.user;
      const normalizedEmail = email.toLowerCase().trim();

      // Check duplicate accounts in DB
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      const existingAdvocate = await prisma.advocate.findUnique({ where: { email: normalizedEmail } });

      if (existingUser || existingAdvocate) {
        // Specific message for advocate if Google account already exists
        const errType = accountType === 'ADVOCATE' ? 'advocate_exists' : 'account_exists';
        return res.redirect(`${clientUrl}/login/${redirectType}?error=${errType}`);
      }

      // Recover registration session ID from state
      const registrationId = req.query.state;
      let session;

      if (registrationId && registrationId !== 'undefined' && registrationId !== 'null') {
        const sessionExists = await prisma.registrationSession.findUnique({
          where: { id: registrationId }
        });

        // If the registration session expired or is invalid
        if (!sessionExists) {
          return res.redirect(`${clientUrl}/register/${redirectType}?error=session_expired`);
        }

        // Verify accountType matches the registration session
        if (sessionExists.accountType !== accountType) {
          return res.redirect(`${clientUrl}/register/${redirectType}?error=invalid_registration_state`);
        }

        // Update existing registration session
        session = await prisma.registrationSession.update({
          where: { id: registrationId },
          data: {
            email: normalizedEmail,
            emailVerified: true,
            fullName: sessionExists.fullName || fullName // Preserve manually entered name if present
          }
        });
      } else {
        // Genuinely no registration session existed: create a new one
        session = await prisma.registrationSession.create({
          data: {
            fullName,
            accountType,
            email: normalizedEmail,
            emailVerified: true,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
          }
        });
      }

      // Determine correct targetStep dynamically depending on what details are incomplete
      let targetStep = 2;
      if (accountType === 'ADVOCATE') {
        if (!session.profilePhotoUrl || !session.gender) {
          targetStep = 2;
        } else if (!session.phoneVerified) {
          targetStep = 3;
        } else {
          targetStep = 4;
        }
      } else {
        // For standard USER, next step after email verification is step 2 (Profile details)
        targetStep = 2;
      }

      return res.redirect(`${clientUrl}/register/${redirectType}?step=${targetStep}&registrationId=${session.id}`);
    } catch (error) {
      console.error('OAuth Callback Controller Error:', error);
      const redirectType = accountType.toLowerCase();
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(`${clientUrl}/login/${redirectType}?error=server_error`);
    }
  };
};

export const googleLoginCallbackHandler = (accountType) => {
  return async (req, res, next) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectType = accountType.toLowerCase();

    try {
      if (!req.user) {
        return res.redirect(`${clientUrl}/login/${redirectType}?error=google_auth_failed`);
      }

      const { email } = req.user;
      const normalizedEmail = email.toLowerCase().trim();

      let account;
      if (accountType === 'USER') {
        account = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      } else {
        account = await prisma.advocate.findUnique({ where: { email: normalizedEmail } });
      }

      if (!account) {
        return res.redirect(`${clientUrl}/login/${redirectType}?error=account_not_found`);
      }

      if (!account.isActive) {
        return res.redirect(`${clientUrl}/login/${redirectType}?error=account_inactive`);
      }

      // Sign JWT and set HTTP-only cookie
      const token = signToken({ id: account.id, type: redirectType });
      sendTokenCookie(res, token);

      return res.redirect(`${clientUrl}/dashboard`);
    } catch (error) {
      console.error('OAuth Login Callback Controller Error:', error);
      return res.redirect(`${clientUrl}/login/${redirectType}?error=server_error`);
    }
  };
};

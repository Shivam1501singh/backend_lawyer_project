import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { signToken, sendTokenCookie } from '../utils/jwt.js';

// In-memory store for single-use OAuth exchange codes (60s TTL)
export const oauthCodeStore = new Map();

// Sweep expired OAuth exchange codes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of oauthCodeStore.entries()) {
    if (now > entry.expiresAt) {
      oauthCodeStore.delete(code);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Resolves base redirect URLs for Web and Mobile clients.
 * - Web client: Configured via WEB_CLIENT_URL or CLIENT_URL (default: 'http://localhost:5173')
 * - Mobile client: Configured via MOBILE_CLIENT_URL or MOBILE_APP_SCHEME (default: 'advocateconnect://')
 */
export const getClientRedirectUrls = (scheme) => {
  const rawWeb = process.env.WEB_CLIENT_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const webBase = rawWeb.replace(/\/+$/, '');

  const fallbackScheme = scheme || process.env.MOBILE_APP_SCHEME || 'advocateconnect';
  let rawMobile = process.env.MOBILE_CLIENT_URL || `${fallbackScheme}://`;
  rawMobile = rawMobile.trim();
  if (!rawMobile.includes('://')) {
    rawMobile = `${rawMobile}://`;
  }
  const mobileBase = rawMobile.endsWith('://') ? rawMobile : `${rawMobile.replace(/\/+$/, '')}/`;

  return { webBase, mobileBase };
};

/**
 * Parses state string passed via OAuth flow.
 * Supports:
 * - base64url JSON string e.g. Buffer.from(JSON.stringify({ client, platform, registrationId, scheme })).toString('base64url')
 * - raw JSON string
 * - plain string fallback ('web', 'mobile', or registrationId)
 *
 * Security: Only permits client to be 'web' or 'mobile'. Defaults safely to 'web' to prevent open redirect vulnerabilities.
 */
export const parseOAuthState = (stateParam) => {
  const defaultScheme = process.env.MOBILE_APP_SCHEME || 'advocateconnect';
  if (!stateParam || stateParam === 'undefined' || stateParam === 'null') {
    return { registrationId: null, client: 'web', platform: 'web', scheme: defaultScheme };
  }

  // 1. Try base64url JSON
  try {
    const jsonStr = Buffer.from(stateParam, 'base64url').toString('utf8');
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      const rawClient = (parsed.client || parsed.platform || 'web').toLowerCase().trim();
      const client = rawClient === 'mobile' ? 'mobile' : 'web';
      return {
        registrationId: parsed.registrationId || null,
        client,
        platform: client,
        scheme: parsed.scheme || defaultScheme
      };
    }
  } catch (e) {}

  // 2. Try raw JSON
  try {
    const parsed = JSON.parse(stateParam);
    if (parsed && typeof parsed === 'object') {
      const rawClient = (parsed.client || parsed.platform || 'web').toLowerCase().trim();
      const client = rawClient === 'mobile' ? 'mobile' : 'web';
      return {
        registrationId: parsed.registrationId || null,
        client,
        platform: client,
        scheme: parsed.scheme || defaultScheme
      };
    }
  } catch (e) {}

  // 3. Fallback: if it's a plain string
  const str = String(stateParam).toLowerCase().trim();
  if (str === 'mobile') {
    return { registrationId: null, client: 'mobile', platform: 'mobile', scheme: defaultScheme };
  }
  if (str === 'web') {
    return { registrationId: null, client: 'web', platform: 'web', scheme: defaultScheme };
  }

  // Fallback for plain registrationId string (default client is web)
  return {
    registrationId: stateParam,
    client: 'web',
    platform: 'web',
    scheme: defaultScheme
  };
};

/**
 * Google Registration Callback Handler
 * Supports Mobile App (Deep Link redirect to MOBILE_CLIENT_URL) and Web (Cookie + WEB_CLIENT_URL redirect)
 */
export const googleCallbackHandler = (accountType) => {
  return async (req, res, next) => {
    const redirectType = accountType.toLowerCase();
    const { registrationId, client, scheme } = parseOAuthState(req.query.state);
    const isMobile = client === 'mobile';
    const { webBase, mobileBase } = getClientRedirectUrls(scheme);

    try {
      // If user profile is not supplied by Passport
      if (!req.user) {
        if (isMobile) {
          return res.redirect(`${mobileBase}register-callback?error=google_auth_failed&type=${redirectType}`);
        }
        return res.redirect(`${webBase}/login/${redirectType}?error=google_auth_failed`);
      }

      const { fullName, email } = req.user;
      const normalizedEmail = email.toLowerCase().trim();

      // Check duplicate accounts in DB
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      const existingAdvocate = await prisma.advocate.findUnique({ where: { email: normalizedEmail } });

      if (existingUser || existingAdvocate) {
        const errType = accountType === 'ADVOCATE' ? 'advocate_exists' : 'account_exists';
        if (isMobile) {
          return res.redirect(`${mobileBase}register-callback?error=${errType}&type=${redirectType}`);
        }
        return res.redirect(`${webBase}/login/${redirectType}?error=${errType}`);
      }

      // Recover registration session ID from state
      let session;

      if (registrationId) {
        const sessionExists = await prisma.registrationSession.findUnique({
          where: { id: registrationId }
        });

        // If the registration session expired or is invalid
        if (!sessionExists) {
          if (isMobile) {
            return res.redirect(`${mobileBase}register-callback?error=session_expired&type=${redirectType}`);
          }
          return res.redirect(`${webBase}/register/${redirectType}?error=session_expired`);
        }

        // Verify accountType matches the registration session
        if (sessionExists.accountType !== accountType) {
          if (isMobile) {
            return res.redirect(`${mobileBase}register-callback?error=invalid_registration_state&type=${redirectType}`);
          }
          return res.redirect(`${webBase}/register/${redirectType}?error=invalid_registration_state`);
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

      // Determine targetStep dynamically
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
        targetStep = 2;
      }

      if (isMobile) {
        const nameEnc = encodeURIComponent(session.fullName || '');
        const emailEnc = encodeURIComponent(session.email || '');
        return res.redirect(`${mobileBase}register-callback?step=${targetStep}&registrationId=${session.id}&type=${redirectType}&fullName=${nameEnc}&email=${emailEnc}`);
      }

      return res.redirect(`${webBase}/register/${redirectType}?step=${targetStep}&registrationId=${session.id}`);
    } catch (error) {
      console.error('OAuth Callback Controller Error:', error);
      if (isMobile) {
        return res.redirect(`${mobileBase}register-callback?error=server_error&type=${redirectType}`);
      }
      return res.redirect(`${webBase}/login/${redirectType}?error=server_error`);
    }
  };
};

/**
 * Google Login Callback Handler
 * Supports both Web (Sets HTTP-Only Cookie + WEB_CLIENT_URL redirect) and Mobile App (Deep Link to MOBILE_CLIENT_URL with 60s single-use exchange code)
 */
export const googleLoginCallbackHandler = (accountType) => {
  return async (req, res, next) => {
    const redirectType = accountType.toLowerCase();
    const { client, scheme } = parseOAuthState(req.query.state);
    const isMobile = client === 'mobile';
    const { webBase, mobileBase } = getClientRedirectUrls(scheme);

    try {
      if (!req.user) {
        if (isMobile) {
          return res.redirect(`${mobileBase}auth-callback?error=google_auth_failed&type=${redirectType}`);
        }
        return res.redirect(`${webBase}/login/${redirectType}?error=google_auth_failed`);
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
        if (isMobile) {
          return res.redirect(`${mobileBase}auth-callback?error=account_not_found&type=${redirectType}`);
        }
        return res.redirect(`${webBase}/login/${redirectType}?error=account_not_found`);
      }

      if (!account.isActive) {
        if (isMobile) {
          return res.redirect(`${mobileBase}auth-callback?error=account_inactive&type=${redirectType}`);
        }
        return res.redirect(`${webBase}/login/${redirectType}?error=account_inactive`);
      }

      // Sign JWT Token
      const token = signToken({ id: account.id, type: redirectType });

      if (isMobile) {
        // Generate single-use exchange code for mobile app
        const code = crypto.randomBytes(32).toString('hex');
        oauthCodeStore.set(code, {
          token,
          user: {
            id: account.id,
            email: account.email,
            fullName: account.fullName,
            accountType: redirectType
          },
          expiresAt: Date.now() + 60 * 1000 // 60s expiry
        });

        return res.redirect(`${mobileBase}auth-callback?code=${code}&type=${redirectType}`);
      }

      // Web flow: Set HTTP-only cookie & redirect to web client dashboard
      sendTokenCookie(res, token);
      return res.redirect(`${webBase}/dashboard`);
    } catch (error) {
      console.error('OAuth Login Callback Controller Error:', error);
      if (isMobile) {
        return res.redirect(`${mobileBase}auth-callback?error=server_error&type=${redirectType}`);
      }
      return res.redirect(`${webBase}/login/${redirectType}?error=server_error`);
    }
  };
};

/**
 * Exchange temporary OAuth code for JWT Token (used by Mobile Apps)
 * POST /api/auth/oauth/exchange
 */
export const exchangeOAuthCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'OAuth authorization code is required'
      });
    }

    const entry = oauthCodeStore.get(code);

    if (!entry) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OAuth authorization code'
      });
    }

    // Delete code immediately to ensure single-use
    oauthCodeStore.delete(code);

    if (Date.now() > entry.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OAuth authorization code has expired'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: entry.token,
      user: entry.user
    });
  } catch (error) {
    next(error);
  }
};

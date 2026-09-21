import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { signToken, sendTokenCookie } from '../utils/jwt.js';

/* ============================================================
   OAUTH EXCHANGE CODE STORE (mobile only)

   Single-use codes with a 60s TTL, swept every 5 minutes.
============================================================ */

export const oauthCodeStore = new Map();

setInterval(() => {
  const now = Date.now();

  for (const [code, entry] of oauthCodeStore.entries()) {
    if (now > entry.expiresAt) {
      oauthCodeStore.delete(code);
    }
  }
}, 5 * 60 * 1000).unref();

/* ============================================================
   WEB ROUTE SHAPE

   The web client renders ONE signup page and ONE login page.
   Account type travels as ?role=, never as a path segment:

     http://localhost:5173/signup?registrationId=...&step=2&role=advocate
     http://localhost:5173/login?error=advocate_exists&role=advocate
============================================================ */

const WEB_SIGNUP_PATH = '/signup';
const WEB_LOGIN_PATH = '/login';

const buildWebUrl = (base, path, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  ).toString();

  return query ? `${base}${path}?${query}` : `${base}${path}`;
};

/**
 * Resolves base redirect URLs for web and mobile clients.
 *
 * Web:    WEB_CLIENT_URL or CLIENT_URL   (default http://localhost:5173)
 * Mobile: MOBILE_CLIENT_URL or MOBILE_APP_SCHEME (default advocateconnect://)
 */
export const getClientRedirectUrls = (scheme) => {
  const rawWeb =
    process.env.WEB_CLIENT_URL ||
    process.env.CLIENT_URL ||
    'http://localhost:5173';

  const webBase = rawWeb.replace(/\/+$/, '');

  const fallbackScheme =
    scheme || process.env.MOBILE_APP_SCHEME || 'advocateconnect';

  let rawMobile =
    process.env.MOBILE_CLIENT_URL || `${fallbackScheme}://`;

  rawMobile = rawMobile.trim();

  if (!rawMobile.includes('://')) {
    rawMobile = `${rawMobile}://`;
  }

  const mobileBase = rawMobile.endsWith('://')
    ? rawMobile
    : `${rawMobile.replace(/\/+$/, '')}/`;

  return { webBase, mobileBase };
};

/* ============================================================
   OAUTH STATE

   Accepted forms:
     1. base64url JSON  { client, platform, registrationId, scheme }
     2. URI-encoded JSON
     3. raw JSON
     4. plain "web" / "mobile"
     5. plain registrationId (backwards compatible)

   Security: client is clamped to 'web' | 'mobile' and defaults to
   'web', so a crafted state can never redirect somewhere else.
============================================================ */

const readStateObject = (parsed, defaultScheme) => {
  const rawClient = String(parsed.client || parsed.platform || 'web')
    .toLowerCase()
    .trim();

  const client = rawClient === 'mobile' ? 'mobile' : 'web';

  return {
    registrationId:
      String(parsed.registrationId || parsed.registration_id || '').trim() ||
      null,
    client,
    platform: client,
    scheme: parsed.scheme || defaultScheme,
  };
};

export const parseOAuthState = (stateParam) => {
  const defaultScheme = process.env.MOBILE_APP_SCHEME || 'advocateconnect';

  if (!stateParam || stateParam === 'undefined' || stateParam === 'null') {
    return {
      registrationId: null,
      client: 'web',
      platform: 'web',
      scheme: defaultScheme,
    };
  }

  const value = String(stateParam).trim();

  /* 1. base64url JSON */
  try {
    const parsed = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8')
    );

    if (parsed && typeof parsed === 'object') {
      return readStateObject(parsed, defaultScheme);
    }
  } catch {
    /* not base64url JSON */
  }

  /* 2. URI-encoded JSON */
  try {
    const parsed = JSON.parse(decodeURIComponent(value));

    if (parsed && typeof parsed === 'object') {
      return readStateObject(parsed, defaultScheme);
    }
  } catch {
    /* not URI-encoded JSON */
  }

  /* 3. raw JSON */
  try {
    const parsed = JSON.parse(value);

    if (parsed && typeof parsed === 'object') {
      return readStateObject(parsed, defaultScheme);
    }
  } catch {
    /* not raw JSON */
  }

  /* 4. plain client string */
  const lowered = value.toLowerCase();

  if (lowered === 'mobile') {
    return {
      registrationId: null,
      client: 'mobile',
      platform: 'mobile',
      scheme: defaultScheme,
    };
  }

  if (lowered === 'web') {
    return {
      registrationId: null,
      client: 'web',
      platform: 'web',
      scheme: defaultScheme,
    };
  }

  /* 5. plain registrationId */
  return {
    registrationId: value,
    client: 'web',
    platform: 'web',
    scheme: defaultScheme,
  };
};

const isUsableRegistrationId = (value) =>
  typeof value === 'string' &&
  value.trim() !== '' &&
  value !== 'undefined' &&
  value !== 'null';

/* ============================================================
   GOOGLE REGISTRATION CALLBACK

   Web success  -> /signup?registrationId=...&step=N&role=...
   Web error    -> /signup?error=...&role=...
   Already has an account -> /login?error=...&role=...
============================================================ */

export const googleCallbackHandler = (accountType) => {
  return async (req, res) => {
    const normalizedAccountType = String(accountType || '')
      .trim()
      .toUpperCase();

    const redirectType =
      normalizedAccountType === 'ADVOCATE' ? 'advocate' : 'user';

    const { registrationId, client, scheme } = parseOAuthState(
      req.query.state
    );

    const isMobile = client === 'mobile';
    const { webBase, mobileBase } = getClientRedirectUrls(scheme);

    const signupError = (error) =>
      buildWebUrl(webBase, WEB_SIGNUP_PATH, { error, role: redirectType });

    const loginError = (error) =>
      buildWebUrl(webBase, WEB_LOGIN_PATH, { error, role: redirectType });

    try {
      /* ---- Passport gave us nothing ---- */

      if (!req.user) {
        if (isMobile) {
          return res.redirect(
            `${mobileBase}register-callback?error=google_auth_failed&type=${redirectType}`
          );
        }

        return res.redirect(signupError('google_auth_failed'));
      }

      const { fullName, email } = req.user;

      if (!email) {
        if (isMobile) {
          return res.redirect(
            `${mobileBase}register-callback?error=google_email_missing&type=${redirectType}`
          );
        }

        return res.redirect(signupError('google_email_missing'));
      }

      const normalizedEmail = email.toLowerCase().trim();

      /* ---- already registered? ---- */

      const [existingUser, existingAdvocate] = await Promise.all([
        prisma.user.findUnique({ where: { email: normalizedEmail } }),
        prisma.advocate.findUnique({ where: { email: normalizedEmail } }),
      ]);

      if (existingUser || existingAdvocate) {
        const errType =
          normalizedAccountType === 'ADVOCATE'
            ? 'advocate_exists'
            : 'account_exists';

        if (isMobile) {
          return res.redirect(
            `${mobileBase}register-callback?error=${errType}&type=${redirectType}`
          );
        }

        /* Send them to LOGIN, not back to signup — otherwise the two
           pages bounce the user between each other. */
        return res.redirect(loginError(errType));
      }

      /* ---- resolve the registration session ---- */

      let session;

      if (isUsableRegistrationId(registrationId)) {
        const sessionExists = await prisma.registrationSession.findUnique({
          where: { id: registrationId },
        });

        if (!sessionExists) {
          if (isMobile) {
            return res.redirect(
              `${mobileBase}register-callback?error=session_expired&type=${redirectType}`
            );
          }

          return res.redirect(signupError('session_expired'));
        }

        if (sessionExists.accountType !== normalizedAccountType) {
          if (isMobile) {
            return res.redirect(
              `${mobileBase}register-callback?error=invalid_registration_state&type=${redirectType}`
            );
          }

          return res.redirect(signupError('invalid_registration_state'));
        }

        session = await prisma.registrationSession.update({
          where: { id: registrationId },
          data: {
            email: normalizedEmail,
            emailVerified: true,
            /* A name typed by hand beats the one Google supplies. */
            fullName:
              sessionExists.fullName?.trim() ||
              fullName?.trim() ||
              normalizedEmail.split('@')[0],
          },
        });
      } else {
        session = await prisma.registrationSession.create({
          data: {
            fullName: fullName?.trim() || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            emailVerified: true,
            accountType: normalizedAccountType,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });
      }

      /* ---- where the wizard should resume ---- */

      let targetStep = 2;

      if (normalizedAccountType === 'ADVOCATE') {
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

      /* ---- success ---- */

      if (isMobile) {
        const nameEnc = encodeURIComponent(session.fullName || '');
        const emailEnc = encodeURIComponent(session.email || '');

        return res.redirect(
          `${mobileBase}register-callback?step=${targetStep}&registrationId=${session.id}&type=${redirectType}&fullName=${nameEnc}&email=${emailEnc}`
        );
      }

      const finalRedirectUrl = buildWebUrl(webBase, WEB_SIGNUP_PATH, {
        registrationId: session.id,
        step: targetStep,
        role: redirectType,
      });

      console.log('GOOGLE REGISTRATION REDIRECT:', finalRedirectUrl);

      return res.redirect(finalRedirectUrl);
    } catch (error) {
      console.error('OAuth Registration Callback Error:', error);

      if (isMobile) {
        return res.redirect(
          `${mobileBase}register-callback?error=server_error&type=${redirectType}`
        );
      }

      return res.redirect(signupError('server_error'));
    }
  };
};

/* ============================================================
   GOOGLE LOGIN CALLBACK

   Web:    HTTP-only cookie, then redirect into the app.
   Mobile: single-use 60s exchange code on a deep link.
============================================================ */

export const googleLoginCallbackHandler = (accountType) => {
  return async (req, res) => {
    const normalizedAccountType = String(accountType || '')
      .trim()
      .toUpperCase();

    const redirectType =
      normalizedAccountType === 'ADVOCATE' ? 'advocate' : 'user';

    const { client, scheme } = parseOAuthState(req.query.state);
    const isMobile = client === 'mobile';
    const { webBase, mobileBase } = getClientRedirectUrls(scheme);

    const loginError = (error) =>
      buildWebUrl(webBase, WEB_LOGIN_PATH, { error, role: redirectType });

    try {
      if (!req.user) {
        if (isMobile) {
          return res.redirect(
            `${mobileBase}auth-callback?error=google_auth_failed&type=${redirectType}`
          );
        }

        return res.redirect(loginError('google_auth_failed'));
      }

      const { email } = req.user;

      if (!email) {
        if (isMobile) {
          return res.redirect(
            `${mobileBase}auth-callback?error=google_email_missing&type=${redirectType}`
          );
        }

        return res.redirect(loginError('google_email_missing'));
      }

      const normalizedEmail = email.toLowerCase().trim();

      const account =
        normalizedAccountType === 'USER'
          ? await prisma.user.findUnique({ where: { email: normalizedEmail } })
          : await prisma.advocate.findUnique({
              where: { email: normalizedEmail },
            });

      if (!account) {
        if (isMobile) {
          return res.redirect(
            `${mobileBase}auth-callback?error=account_not_found&type=${redirectType}`
          );
        }

        return res.redirect(loginError('account_not_found'));
      }

      if (account.isActive === false) {
        if (isMobile) {
          return res.redirect(
            `${mobileBase}auth-callback?error=account_inactive&type=${redirectType}`
          );
        }

        return res.redirect(loginError('account_inactive'));
      }

      if (normalizedAccountType === 'ADVOCATE') {
        await prisma.advocate.update({
          where: { id: account.id },
          data: {
            isOnline: true,
            lastSeenAt: new Date()
          }
        }).catch(() => {});
      }

      const token = signToken({
        id: account.id,
        type: normalizedAccountType.toLowerCase(),
      });

      if (isMobile) {
        const code = crypto.randomBytes(32).toString('hex');

        oauthCodeStore.set(code, {
          token,
          user: {
            id: account.id,
            email: account.email,
            fullName: account.fullName,
            accountType: redirectType,
          },
          expiresAt: Date.now() + 60 * 1000,
        });

        return res.redirect(
          `${mobileBase}auth-callback?code=${code}&type=${redirectType}`
        );
      }

      sendTokenCookie(res, token);

      /* Advocates land in their workspace, users at the app root. */
      return res.redirect(
        normalizedAccountType === 'ADVOCATE'
          ? `${webBase}/advocate/dashboard`
          : `${webBase}/`
      );
    } catch (error) {
      console.error('OAuth Login Callback Error:', error);

      if (isMobile) {
        return res.redirect(
          `${mobileBase}auth-callback?error=server_error&type=${redirectType}`
        );
      }

      return res.redirect(loginError('server_error'));
    }
  };
};

/* ============================================================
   EXCHANGE OAUTH CODE (mobile)

   POST /api/auth/oauth/exchange
============================================================ */

export const exchangeOAuthCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'OAuth authorization code is required',
      });
    }

    const entry = oauthCodeStore.get(code);

    if (!entry) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OAuth authorization code',
      });
    }

    /* Deleted immediately so the code can only ever be used once. */
    oauthCodeStore.delete(code);

    if (Date.now() > entry.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OAuth authorization code has expired',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: entry.token,
      user: entry.user,
    });
  } catch (error) {
    next(error);
  }
};

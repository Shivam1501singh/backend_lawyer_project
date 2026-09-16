import express from 'express';
import passport from 'passport';
import { googleCallbackHandler, googleLoginCallbackHandler, exchangeOAuthCode } from '../controllers/oauth.controller.js';
import { oauthLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

/**
 * Middleware to validate client query parameter before OAuth initiation.
 * Accepts 'web' and 'mobile' (case-insensitive).
 * Defaults to 'web' if not provided for backward compatibility.
 * Rejects unrecognized clients with 400 Bad Request to prevent open redirect abuse.
 */
export const validateOAuthClientMiddleware = (req, res, next) => {
  const rawClient = req.query.client ?? req.query.platform;
  if (rawClient !== undefined && rawClient !== null && rawClient !== '') {
    const normalized = String(rawClient).toLowerCase().trim();
    if (normalized !== 'web' && normalized !== 'mobile') {
      return res.status(400).json({
        success: false,
        message: 'Invalid client. Must be "web" or "mobile"'
      });
    }
  }
  next();
};

/**
 * Builds encoded OAuth state parameter containing client, platform, registrationId, and custom scheme
 */
export const buildOAuthState = (req) => {
  const rawClient = (req.query.client || req.query.platform || 'web').toLowerCase().trim();
  const client = rawClient === 'mobile' ? 'mobile' : 'web';
  const { registrationId, scheme } = req.query;
  const stateObj = {
    client,
    platform: client,
    registrationId: registrationId || null,
    scheme: scheme || process.env.MOBILE_APP_SCHEME || 'advocateconnect'
  };
  return Buffer.from(JSON.stringify(stateObj)).toString('base64url');
};

// -------------------------------------------------------------
// Generic Google OAuth Initiation Endpoints (/google & /google/login)
// Default to User Google Login
// -------------------------------------------------------------
router.get('/google',
  oauthLimiter,
  validateOAuthClientMiddleware,
  (req, res, next) => {
    passport.authenticate('google-user-login', {
      scope: ['profile', 'email'],
      session: false,
      state: buildOAuthState(req)
    })(req, res, next);
  }
);

router.get('/google/login',
  oauthLimiter,
  validateOAuthClientMiddleware,
  (req, res, next) => {
    passport.authenticate('google-user-login', {
      scope: ['profile', 'email'],
      session: false,
      state: buildOAuthState(req)
    })(req, res, next);
  }
);

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google-user-login', { session: false }, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    return googleLoginCallbackHandler('USER')(req, res, next);
  })(req, res, next);
});

// -------------------------------------------------------------
// User Registration via Google OAuth
// -------------------------------------------------------------
router.get('/user/google/register',
  oauthLimiter,
  validateOAuthClientMiddleware,
  (req, res, next) => {
    passport.authenticate('google-user-register', {
      scope: ['profile', 'email'],
      session: false,
      state: buildOAuthState(req)
    })(req, res, next);
  }
);

router.get('/user/google/register/callback', (req, res, next) => {
  passport.authenticate('google-user-register', { session: false }, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    return googleCallbackHandler('USER')(req, res, next);
  })(req, res, next);
});

// -------------------------------------------------------------
// User Login via Google OAuth
// -------------------------------------------------------------
router.get('/user/google/login',
  oauthLimiter,
  validateOAuthClientMiddleware,
  (req, res, next) => {
    passport.authenticate('google-user-login', {
      scope: ['profile', 'email'],
      session: false,
      state: buildOAuthState(req)
    })(req, res, next);
  }
);

router.get('/user/google/login/callback', (req, res, next) => {
  passport.authenticate('google-user-login', { session: false }, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    return googleLoginCallbackHandler('USER')(req, res, next);
  })(req, res, next);
});

// -------------------------------------------------------------
// Advocate Registration via Google OAuth
// -------------------------------------------------------------
router.get('/advocate/google/register',
  oauthLimiter,
  validateOAuthClientMiddleware,
  (req, res, next) => {
    passport.authenticate('google-advocate-register', {
      scope: ['profile', 'email'],
      session: false,
      state: buildOAuthState(req)
    })(req, res, next);
  }
);

router.get('/advocate/google/register/callback', (req, res, next) => {
  passport.authenticate('google-advocate-register', { session: false }, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    return googleCallbackHandler('ADVOCATE')(req, res, next);
  })(req, res, next);
});

// -------------------------------------------------------------
// Advocate Login via Google OAuth
// -------------------------------------------------------------
router.get('/advocate/google/login',
  oauthLimiter,
  validateOAuthClientMiddleware,
  (req, res, next) => {
    passport.authenticate('google-advocate-login', {
      scope: ['profile', 'email'],
      session: false,
      state: buildOAuthState(req)
    })(req, res, next);
  }
);

router.get('/advocate/google/login/callback', (req, res, next) => {
  passport.authenticate('google-advocate-login', { session: false }, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    return googleLoginCallbackHandler('ADVOCATE')(req, res, next);
  })(req, res, next);
});

// -------------------------------------------------------------
// Mobile OAuth Exchange Endpoint
// Exchanging 60-second single-use code for JWT token
// -------------------------------------------------------------
router.post('/oauth/exchange', oauthLimiter, exchangeOAuthCode);
router.post('/exchange', oauthLimiter, exchangeOAuthCode);
router.post('/auth/oauth/exchange', oauthLimiter, exchangeOAuthCode);

export default router;

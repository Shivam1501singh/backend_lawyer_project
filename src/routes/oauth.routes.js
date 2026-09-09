import express from 'express';
import passport from 'passport';
import { googleCallbackHandler, googleLoginCallbackHandler, exchangeOAuthCode } from '../controllers/oauth.controller.js';
import { oauthLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

/**
 * Builds encoded OAuth state parameter containing platform, registrationId, and custom scheme
 */
const buildOAuthState = (req) => {
  const { registrationId, platform, scheme } = req.query;
  const stateObj = {
    registrationId: registrationId || null,
    platform: platform || 'web',
    scheme: scheme || process.env.MOBILE_APP_SCHEME || 'advocateconnect'
  };
  return Buffer.from(JSON.stringify(stateObj)).toString('base64url');
};

// -------------------------------------------------------------
// User Registration via Google OAuth
// -------------------------------------------------------------
router.get('/user/google/register',
  oauthLimiter,
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

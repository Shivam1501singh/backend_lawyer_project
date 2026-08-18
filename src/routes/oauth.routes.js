import express from 'express';
import passport from 'passport';
import { googleCallbackHandler, googleLoginCallbackHandler } from '../controllers/oauth.controller.js';
import { oauthLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

// User registration via Google OAuth
router.get('/user/google/register',
  oauthLimiter,
  (req, res, next) => {
    const { registrationId } = req.query;
    passport.authenticate('google-user-register', {
      scope: ['profile', 'email'],
      session: false,
      state: registrationId || undefined
    })(req, res, next);
  }
);

router.get('/user/google/register/callback',
  passport.authenticate('google-user-register', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login/user?error=google_auth_failed`, session: false }),
  googleCallbackHandler('USER')
);

// User login via Google OAuth
router.get('/user/google/login',
  oauthLimiter,
  passport.authenticate('google-user-login', { scope: ['profile', 'email'], session: false })
);

router.get('/user/google/login/callback',
  passport.authenticate('google-user-login', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login/user?error=google_auth_failed`, session: false }),
  googleLoginCallbackHandler('USER')
);

// Advocate registration via Google OAuth
router.get('/advocate/google/register',
  oauthLimiter,
  (req, res, next) => {
    const { registrationId } = req.query;
    passport.authenticate('google-advocate-register', {
      scope: ['profile', 'email'],
      session: false,
      state: registrationId || undefined
    })(req, res, next);
  }
);

router.get('/advocate/google/register/callback',
  passport.authenticate('google-advocate-register', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login/advocate?error=google_auth_failed`, session: false }),
  googleCallbackHandler('ADVOCATE')
);

// Advocate login via Google OAuth
router.get('/advocate/google/login',
  oauthLimiter,
  passport.authenticate('google-advocate-login', { scope: ['profile', 'email'], session: false })
);

router.get('/advocate/google/login/callback',
  passport.authenticate('google-advocate-login', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login/advocate?error=google_auth_failed`, session: false }),
  googleLoginCallbackHandler('ADVOCATE')
);

export default router;

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../lib/prisma.js';

// Setup common google oauth verification helper
const verifyGoogleRegister = async (profile, done) => {
  try {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const emailVerified = profile._json.email_verified;

    if (!email) {
      return done(null, false, { message: 'No email found in Google account.' });
    }

    if (!emailVerified) {
      return done(null, false, { message: 'Google email is not verified.' });
    }

    const fullName = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User';

    return done(null, {
      googleId: profile.id,
      fullName,
      email
    });
  } catch (error) {
    return done(error);
  }
};

// 1. Google Strategy for User Registration
passport.use('google-user-register', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: process.env.GOOGLE_USER_REGISTER_CALLBACK_URL || 'http://localhost:5000/api/auth/user/google/register/callback',
    passReqToCallback: false
  },
  async (accessToken, refreshToken, profile, done) => {
    await verifyGoogleRegister(profile, done);
  }
));

// 2. Google Strategy for Advocate Registration
passport.use('google-advocate-register', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: process.env.GOOGLE_ADVOCATE_REGISTER_CALLBACK_URL || 'http://localhost:5000/api/auth/advocate/google/register/callback',
    passReqToCallback: false
  },
  async (accessToken, refreshToken, profile, done) => {
    await verifyGoogleRegister(profile, done);
  }
));

// 3. Google Strategy for User Login
passport.use('google-user-login', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: process.env.GOOGLE_USER_LOGIN_CALLBACK_URL || 'http://localhost:5000/api/auth/user/google/login/callback',
    passReqToCallback: false
  },
  async (accessToken, refreshToken, profile, done) => {
    await verifyGoogleRegister(profile, done);
  }
));

// 4. Google Strategy for Advocate Login
passport.use('google-advocate-login', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: process.env.GOOGLE_ADVOCATE_LOGIN_CALLBACK_URL || 'http://localhost:5000/api/auth/advocate/google/login/callback',
    passReqToCallback: false
  },
  async (accessToken, refreshToken, profile, done) => {
    await verifyGoogleRegister(profile, done);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;

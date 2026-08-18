import rateLimit from 'express-rate-limit';

// Standard fallback rate limiter for general routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiter for sending OTP (Email or SMS) to prevent spamming/abuse
export const sendOtpLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 3, // Limit each IP to 3 OTP send requests per 2 minutes
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 2 minutes before requesting a new OTP.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiter for verifying OTP to prevent brute-force attacks
export const verifyOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 verify attempts per 5 minutes
  message: {
    success: false,
    message: 'Too many verification attempts. Please wait 5 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiter for OAuth routes to prevent abuse
export const oauthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit Google OAuth flow starts/callbacks to 10 per 10 minutes
  message: {
    success: false,
    message: 'Too many OAuth requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiter for submitting help requests to prevent spam
export const helpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 help requests per 15 minutes
  message: {
    success: false,
    message: 'Too many help requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiter for submitting reviews to prevent spam
export const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 review updates/submits per 15 minutes
  message: {
    success: false,
    message: 'Too many review requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});


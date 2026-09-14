import prisma from '../lib/prisma.js';
import { ZodError } from 'zod';

/**
 * Redacts sensitive data such as Aadhaar numbers, JWT tokens, passwords, and OTPs.
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return text || '';

  let sanitized = text;

  // Redact 12-digit Aadhaar numbers (with optional dashes or spaces) -> e.g. XXXX-XXXX-9012
  sanitized = sanitized.replace(/\b(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})\b/g, 'XXXX-XXXX-$3');

  // Redact Bearer authorization header tokens
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, 'Bearer [REDACTED_TOKEN]');

  // Redact raw JWT patterns
  sanitized = sanitized.replace(/\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*\b/g, '[REDACTED_JWT]');

  // Redact key-value sensitive data fields in strings
  sanitized = sanitized.replace(/(password|passwordHash|accessToken|refreshToken|otp|otpHash|resetToken)["']?\s*[:=]\s*["']?[^"'\s,}]*/gi, '$1: "[REDACTED]"');

  return sanitized;
};

/**
 * Determines HTTP status code associated with an error.
 */
export const determineStatusCode = (err) => {
  if (!err) return 500;
  if (typeof err.statusCode === 'number') return err.statusCode;
  if (typeof err.status === 'number') return err.status;
  if (err instanceof ZodError || err.name === 'ZodError') return 400;

  const isControlledError = [
    'session',
    'not found',
    'exists',
    'invalid',
    'expired',
    'incorrect',
    'verification',
    'verify',
    'phone number',
    'address',
    'otp',
    'deactivated',
    'max attempts',
    'attempts remaining'
  ].some(keyword => err.message && typeof err.message === 'string' && err.message.toLowerCase().includes(keyword));

  if (isControlledError) return 400;

  if (err.message && typeof err.message === 'string' && (err.message.includes('transmission failed') || err.message.includes('timed out'))) {
    return 502;
  }

  return 500;
};

/**
 * Extracts IP address safely from request.
 */
export const extractIpAddress = (req) => {
  if (!req) return '127.0.0.1';
  const xForwardedFor = req.headers ? req.headers['x-forwarded-for'] : null;
  if (xForwardedFor) {
    const ips = String(xForwardedFor).split(',');
    return ips[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
};

/**
 * Centralized fail-safe error logger to database.
 */
export const logApiError = async (err, req) => {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toISOString().split('T')[1].split('.')[0];

    const ipAddress = extractIpAddress(req);
    const method = req?.method || 'UNKNOWN';
    const url = req?.originalUrl || req?.url || '/';
    const path = req?.path || url.split('?')[0];
    const statusCode = determineStatusCode(err);

    const rawMessage = err?.message || String(err || 'Unknown Error');
    const rawStack = err?.stack || '';
    const errorName = err?.name || 'Error';

    const errorMessage = sanitizeText(rawMessage);
    const errorStack = sanitizeText(rawStack);

    let userId = null;
    let userType = null;

    if (req?.user) {
      userId = req.user.id || null;
      userType = req.user.role || req.user.type || req.user.accountType || null;
    }

    const requestId = req?.id || (req?.headers ? req.headers['x-request-id'] : null) || null;

    await prisma.errorLog.create({
      data: {
        ipAddress,
        method,
        url,
        path,
        statusCode,
        errorName,
        errorMessage,
        errorStack,
        date,
        time,
        userId: userId ? String(userId) : null,
        userType: userType ? String(userType) : null,
        requestId: requestId ? String(requestId) : null
      }
    });
  } catch (loggingError) {
    // Fail-safe: ensure logging error never disrupts server execution or API response
    try {
      console.error('[ErrorLogger Persistence Failed]:', loggingError.message || String(loggingError));
    } catch (_) {
      // Ignore fallback console logging errors
    }
  }
};

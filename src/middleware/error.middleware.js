import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error middleware caught error]:', err);

  // Zod Validation Errors
  if (err instanceof ZodError) {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  // Common controlled application errors (e.g., duplicate checks, verification issues)
  const isControlledError = [
    'session',
    'not found',
    'exists',
    'invalid',
    'expired',
    'incorrect',
    'verification',
    'otp',
    'deactivated',
    'max attempts',
    'attempts remaining'
  ].some(keyword => err.message && err.message.toLowerCase().includes(keyword));

  if (isControlledError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Handle gateway/network failures from provider gracefully
  if (err.message.includes('transmission failed') || err.message.includes('timed out')) {
    return res.status(502).json({
      success: false,
      message: 'OTP could not be sent. Please try again.'
    });
  }

  // Fallback for unexpected server errors
  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred. Please try again later.',
    error: isProduction ? {} : err.stack || err.message
  });
};

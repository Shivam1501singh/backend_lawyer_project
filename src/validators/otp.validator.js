import { z } from 'zod';

export const otpSchema = z.string()
  .trim()
  .length(6, { message: 'OTP must be exactly 6 digits.' })
  .regex(/^\d{6}$/, { message: 'OTP must contain only numbers.' });

export const phoneSchema = z.string()
  .trim()
  .regex(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits.' });

export const pincodeSchema = z.string()
  .trim()
  .regex(/^\d{6}$/, { message: 'Pincode must be exactly 6 digits.' });

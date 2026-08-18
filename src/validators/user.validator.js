import { z } from 'zod';
import { otpSchema, phoneSchema, pincodeSchema } from './otp.validator.js';

export const startRegistrationSchema = z.object({
  fullName: z.string({ required_error: 'Full Name is required.' })
    .trim()
    .min(2, { message: 'Full Name must be at least 2 characters.' })
    .max(100, { message: 'Full Name cannot exceed 100 characters.' }),
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase(),
  registrationId: z.string().uuid().optional()
});

export const sendEmailOtpSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase()
});

export const verifyEmailOtpSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  otp: otpSchema
});

export const completeProfileSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  city: z.string().trim().min(2, { message: 'City must be at least 2 characters.' }),
  state: z.string().trim().min(2, { message: 'State must be at least 2 characters.' }),
  pincode: pincodeSchema,
  phone: phoneSchema
});

export const sendPhoneOtpSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' })
});

export const verifyPhoneSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  otp: otpSchema
});

export const loginSendOtpSchema = z.object({
  phone: phoneSchema
});

export const loginVerifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema
});

export const loginSendEmailOtpSchema = z.object({
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase()
});

export const loginVerifyEmailOtpSchema = z.object({
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase(),
  otp: otpSchema
});

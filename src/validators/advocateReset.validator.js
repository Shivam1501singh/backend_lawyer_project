import { z } from 'zod';

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address').toLowerCase().optional(),
    phone: z.string().trim().min(5, 'Please enter a valid phone number').optional()
  })
  .refine((data) => (data.email && !data.phone) || (!data.email && data.phone), {
    message: 'Please provide either a registered email or a registered phone number.'
  });

export const verifyResetOtpSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address').toLowerCase().optional(),
    phone: z.string().trim().min(5, 'Please enter a valid phone number').optional(),
    otp: z
      .string({ required_error: 'OTP is required' })
      .trim()
      .regex(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  })
  .refine((data) => (data.email && !data.phone) || (!data.email && data.phone), {
    message: 'Please provide either an email or a phone number.'
  });

export const resetPasswordSchema = z
  .object({
    resetToken: z
      .string({ required_error: 'Reset token is required' })
      .trim()
      .min(1, 'Reset token is required'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(1, 'Confirm password is required')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword']
  });

import { z } from 'zod';
import { phoneSchema } from './otp.validator.js';

export const createConsultancyRequestSchema = z.object({
  callType: z.enum(['CALL', 'VIDEO_CALL'], {
    errorMap: () => ({ message: "Call type must be either 'CALL' or 'VIDEO_CALL'." })
  }),
  duration: z.union([z.literal(15), z.literal(30)], {
    errorMap: () => ({ message: 'Duration must be either 15 or 30 minutes.' })
  }),
  phoneNumber: phoneSchema,
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase()
}).strict();

export const adminUpdateConsultancyStatusSchema = z.object({
  status: z.enum(['COMPLETED'], {
    errorMap: () => ({ message: "Status must be 'COMPLETED'." })
  })
}).strict();

export const adminConsultancyQuerySchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED'], {
    errorMap: () => ({ message: "Status filter must be either 'PENDING' or 'COMPLETED'." })
  }).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

export const userConsultancyQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

import { z } from 'zod';

export const createFeedbackSchema = z.object({
  description: z.string({ required_error: 'Description is required.' })
    .trim()
    .min(3, { message: 'Description must be at least 3 characters long.' })
    .max(2000, { message: 'Description cannot exceed 2000 characters.' })
}).strict();

export const adminFeedbackQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

import { z } from 'zod';

export const createUserRightSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required and must not be empty')
    .max(255, 'Title must not exceed 255 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description is required and must not be empty')
});

export const updateUserRightSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title must not be empty')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .min(1, 'Description must not be empty')
    .optional()
});

export const getUserRightsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Page must be a positive integer' }),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive integer' })
    .refine((val) => val <= 50, { message: 'Limit cannot exceed 50' })
});

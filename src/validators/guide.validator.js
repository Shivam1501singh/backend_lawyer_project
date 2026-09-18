import { z } from 'zod';

export const createGuideSchema = z.object({
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

export const updateGuideSchema = z.object({
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
}).refine((data) => data.title !== undefined || data.description !== undefined, {
  message: 'At least one field (title or description) must be provided for update'
});

export const getGuidesQuerySchema = z.object({
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

import { z } from 'zod';

export const createUpdateSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required and must not be empty')
    .max(255, 'Title must not exceed 255 characters'),
  oldDescription: z
    .string({ required_error: 'Old description is required' })
    .trim()
    .min(1, 'Old description is required and must not be empty'),
  newDescription: z
    .string({ required_error: 'New description is required' })
    .trim()
    .min(1, 'New description is required and must not be empty')
});

export const updateUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title must not be empty')
    .max(255, 'Title must not exceed 255 characters')
    .optional(),
  oldDescription: z
    .string()
    .trim()
    .min(1, 'Old description must not be empty')
    .optional(),
  newDescription: z
    .string()
    .trim()
    .min(1, 'New description must not be empty')
    .optional()
}).refine((data) => data.title !== undefined || data.oldDescription !== undefined || data.newDescription !== undefined, {
  message: 'At least one field (title, oldDescription, or newDescription) must be provided for update'
});

export const getUpdatesQuerySchema = z.object({
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

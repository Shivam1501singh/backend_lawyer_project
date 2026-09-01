import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
});

export const createBlogSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, 'Heading is required'),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required'),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format'
    })
    .transform((val) => new Date(val)),
  writtenBy: z
    .string()
    .trim()
    .min(1, 'Written By is required'),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required'),
  metaTitle: z
    .string({ required_error: 'Meta title is required' })
    .trim()
    .min(1, 'Meta title is required')
    .max(60, 'Meta title must not exceed 60 characters'),
  metaDescription: z
    .string({ required_error: 'Meta description is required' })
    .trim()
    .min(1, 'Meta description is required')
    .max(160, 'Meta description must not exceed 160 characters'),
  metaKeywords: z
    .string()
    .trim()
    .max(500, 'Meta keywords must not exceed 500 characters')
    .optional()
    .nullable()
});

export const updateBlogSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, 'Heading is required')
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format'
    })
    .transform((val) => new Date(val))
    .optional(),
  writtenBy: z
    .string()
    .trim()
    .min(1, 'Written By is required')
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .optional(),
  metaTitle: z
    .string({ required_error: 'Meta title is required' })
    .trim()
    .min(1, 'Meta title is required')
    .max(60, 'Meta title must not exceed 60 characters'),
  metaDescription: z
    .string({ required_error: 'Meta description is required' })
    .trim()
    .min(1, 'Meta description is required')
    .max(160, 'Meta description must not exceed 160 characters'),
  metaKeywords: z
    .string()
    .trim()
    .max(500, 'Meta keywords must not exceed 500 characters')
    .optional()
    .nullable()
});

export const getBlogsQuerySchema = z.object({
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

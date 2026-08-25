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
    .min(1, 'Content is required')
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
    .optional()
});

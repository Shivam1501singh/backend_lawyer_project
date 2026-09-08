import { z } from 'zod';

const parseKeywords = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((k) => String(k).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val.split(',').map((k) => k.trim()).filter(Boolean);
  }
  return [];
};

export const checkForbiddenIPCFields = (body) => {
  const forbidden = ['actType', 'id', 'createdAt', 'updatedAt', 'createdBy'];
  for (const field of forbidden) {
    if (body && Object.prototype.hasOwnProperty.call(body, field)) {
      throw new Error(`Field '${field}' cannot be provided by the client`);
    }
  }
};

export const createIPCSectionSchema = z.object({
  sectionNo: z
    .string({ required_error: 'Section number is required' })
    .trim()
    .min(1, 'Section number is required'),
  heading: z
    .string({ required_error: 'Heading is required' })
    .trim()
    .min(1, 'Heading is required'),
  paragraph: z
    .string({ required_error: 'Paragraph is required' })
    .trim()
    .min(1, 'Paragraph is required'),
  explanation: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  content: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  metaTitle: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  keywords: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .nullable()
    .transform(parseKeywords),
  metaDescription: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null))
});

export const updateIPCSectionSchema = z.object({
  sectionNo: z
    .string()
    .trim()
    .min(1, 'Section number cannot be empty')
    .optional(),
  heading: z
    .string()
    .trim()
    .min(1, 'Heading cannot be empty')
    .optional(),
  paragraph: z
    .string()
    .trim()
    .min(1, 'Paragraph cannot be empty')
    .optional(),
  explanation: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? val : val.trim() || null)),
  content: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? val : val.trim() || null)),
  metaTitle: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? val : val.trim() || null)),
  keywords: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? val : parseKeywords(val))),
  metaDescription: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? val : val.trim() || null))
});

export const getIPCQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Page must be a positive integer' }),
  limit: z
    .string()
    .optional()
    .default('15')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive integer' })
    .refine((val) => val <= 100, { message: 'Limit cannot exceed 100' })
});

export const searchIPCQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .default('')
    .transform((val) => val.trim()),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Page must be a positive integer' }),
  limit: z
    .string()
    .optional()
    .default('15')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive integer' })
    .refine((val) => val <= 100, { message: 'Limit cannot exceed 100' })
});

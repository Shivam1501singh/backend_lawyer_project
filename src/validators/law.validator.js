import { z } from 'zod';

export const lawTypeEnum = z.enum(['BNSS', 'BSA'], {
  errorMap: () => ({ message: "lawType is required and must be either 'BNSS' or 'BSA'" })
});

export const checkForbiddenLawFields = (body) => {
  const forbidden = ['id', 'createdAt', 'updatedAt'];
  for (const field of forbidden) {
    if (body && Object.prototype.hasOwnProperty.call(body, field)) {
      throw new Error(`Field '${field}' cannot be provided by the client`);
    }
  }
};

export const createLawSectionSchema = z.object({
  lawType: lawTypeEnum,
  sectionNo: z
    .string({ required_error: 'sectionNo is required' })
    .trim()
    .min(1, 'sectionNo cannot be empty'),
  heading: z
    .string({ required_error: 'heading is required' })
    .trim()
    .min(1, 'heading cannot be empty'),
  sectionText: z
    .string({ required_error: 'sectionText is required' })
    .trim()
    .min(1, 'sectionText cannot be empty'),
  explanation: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  illustration: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null))
});

export const updateLawSectionSchema = z.object({
  lawType: lawTypeEnum,
  sectionNo: z
    .string()
    .trim()
    .min(1, 'sectionNo cannot be empty')
    .optional(),
  heading: z
    .string()
    .trim()
    .min(1, 'heading cannot be empty')
    .optional(),
  sectionText: z
    .string()
    .trim()
    .min(1, 'sectionText cannot be empty')
    .optional(),
  explanation: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? val : val.trim() || null)),
  illustration: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === null || val === undefined ? val : val.trim() || null))
});

export const lawTypeQuerySchema = z.object({
  lawType: lawTypeEnum
});

export const getLawsQuerySchema = z.object({
  lawType: lawTypeEnum,
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
    .refine((val) => val <= 100, { message: 'Limit cannot exceed 100' })
});

export const searchLawsQuerySchema = z.object({
  lawType: lawTypeEnum,
  q: z
    .string({ required_error: 'Query parameter q is required' })
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
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive integer' })
    .refine((val) => val <= 100, { message: 'Limit cannot exceed 100' })
});

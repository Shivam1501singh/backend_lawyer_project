import { z } from 'zod';

/**
 * Normalizes input entity type
 */
export const normalizeEntityType = (type) => {
  if (!type || typeof type !== 'string') return '';
  const upper = type.trim().toUpperCase();
  if (upper === 'ACT_SECTION') return 'SECTION';
  return upper;
};

/**
 * Normalizes operation
 */
export const normalizeOperation = (operation) => {
  if (!operation || typeof operation !== 'string') return '';
  return operation.trim().toUpperCase();
};

/**
 * Top level write payload validation
 */
export const contentCreatorWriteSchema = z.object({
  type: z.string({ required_error: 'type is required' })
    .transform((val) => normalizeEntityType(val))
    .refine((val) => ['BEARER_ACT', 'ACT', 'SECTION'].includes(val), {
      message: 'Invalid entity type. Allowed types: BEARER_ACT, ACT, SECTION'
    }),
  operation: z.string({ required_error: 'operation is required' })
    .transform((val) => normalizeOperation(val))
    .refine((val) => ['CREATE', 'UPDATE'].includes(val), {
      message: 'Invalid operation. Allowed operations: CREATE, UPDATE'
    }),
  data: z.record(z.any(), { required_error: 'data object is required' })
});

// Helper for string or json metadata
const metaDataField = z.union([z.string(), z.record(z.any()), z.array(z.any())])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === undefined || val === null) return null;
    if (typeof val === 'string') return val.trim();
    return JSON.stringify(val);
  });

// --- BearerAct Schemas ---
export const createBearerActSchema = z.object({
  name: z.string({ required_error: 'Bearer Act category name is required' })
    .trim()
    .min(1, 'Bearer Act category name cannot be empty')
});

export const updateBearerActSchema = z.object({
  id: z.string({ required_error: 'id is required for update' })
    .trim()
    .min(1, 'id cannot be empty'),
  name: z.string()
    .trim()
    .min(1, 'Bearer Act category name cannot be empty')
    .optional()
});

// --- Act Schemas ---
export const createActSchema = z.object({
  bearerActId: z.string({ required_error: 'bearerActId is required' })
    .trim()
    .min(1, 'bearerActId cannot be empty'),
  heading: z.string({ required_error: 'heading is required' })
    .trim()
    .min(1, 'heading cannot be empty'),
  act: z.string({ required_error: 'act is required' })
    .trim()
    .min(1, 'act cannot be empty'),
  year: z.coerce.number({
    required_error: 'year is required',
    invalid_type_error: 'year must be a valid integer'
  })
    .int('year must be a valid integer')
    .min(1000, 'year must be a 4-digit valid year')
    .max(9999, 'year must be a 4-digit valid year')
});

export const updateActSchema = z.object({
  id: z.string({ required_error: 'id is required for update' })
    .trim()
    .min(1, 'id cannot be empty'),
  bearerActId: z.string().trim().min(1, 'bearerActId cannot be empty').optional(),
  heading: z.string().trim().min(1, 'heading cannot be empty').optional(),
  act: z.string().trim().min(1, 'act cannot be empty').optional(),
  year: z.coerce.number({ invalid_type_error: 'year must be a valid integer' })
    .int('year must be a valid integer')
    .min(1000, 'year must be a 4-digit valid year')
    .max(9999, 'year must be a 4-digit valid year')
    .optional()
});

// --- Section Schemas ---
export const createSectionSchema = z.object({
  actId: z.string({ required_error: 'actId is required' })
    .trim()
    .min(1, 'actId cannot be empty'),
  section: z.string({ required_error: 'section is required' })
    .trim()
    .min(1, 'section cannot be empty'),
  chapterNo: z.coerce.number({
    required_error: 'chapterNo is required',
    invalid_type_error: 'chapterNo must be a valid integer'
  })
    .int('chapterNo must be an integer'),
  chapterName: z.string({ required_error: 'chapterName is required' })
    .trim()
    .min(1, 'chapterName cannot be empty'),
  title: z.string({ required_error: 'title is required' })
    .trim()
    .min(1, 'title cannot be empty'),
  description: z.string({ required_error: 'description is required' })
    .trim()
    .min(1, 'description cannot be empty'),
  metaData: metaDataField,
  metaDescription: z.string().trim().optional().nullable(),
  metaTitle: z.string().trim().optional().nullable()
});

export const updateSectionSchema = z.object({
  id: z.string({ required_error: 'id is required for update' })
    .trim()
    .min(1, 'id cannot be empty'),
  actId: z.string().trim().min(1, 'actId cannot be empty').optional(),
  section: z.string().trim().min(1, 'section cannot be empty').optional(),
  chapterNo: z.coerce.number({ invalid_type_error: 'chapterNo must be a valid integer' })
    .int('chapterNo must be an integer')
    .optional(),
  chapterName: z.string().trim().min(1, 'chapterName cannot be empty').optional(),
  title: z.string().trim().min(1, 'title cannot be empty').optional(),
  description: z.string().trim().min(1, 'description cannot be empty').optional(),
  metaData: metaDataField,
  metaDescription: z.string().trim().optional().nullable(),
  metaTitle: z.string().trim().optional().nullable()
});

// --- Query Pagination Schema ---
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

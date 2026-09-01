import { z } from 'zod';

export const createCaseRequestSchema = z.object({
  note: z.string({
    required_error: 'Note is required.'
  })
    .trim()
    .min(1, 'Note cannot be empty.')
    .max(500, 'Note cannot exceed 500 characters.'),
  
  description: z.string({
    required_error: 'Case description is required.'
  })
    .trim()
    .min(1, 'Case description cannot be empty.')
    .max(5000, 'Case description cannot exceed 5000 characters.')
});

export const statusQuerySchema = z.enum(['PENDING', 'CONNECTED', 'REJECTED']).optional();

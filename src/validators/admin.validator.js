import { z } from 'zod';

export const adminApproveAdvocateSchema = z.object({
  approvalStatus: z.enum(['APPROVED', 'REJECTED']).optional(),
  callAvailability: z.boolean({
    invalid_type_error: 'callAvailability must be a boolean.'
  }).optional()
}).strict();

export const adminUpdateAdvocateCallAvailabilitySchema = z.object({
  callAvailability: z.boolean({
    required_error: 'callAvailability is required.',
    invalid_type_error: 'callAvailability must be a boolean.'
  })
}).strict();

export const adminUpdateAdvocateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED']).optional(),
  callAvailability: z.boolean({
    invalid_type_error: 'callAvailability must be a boolean.'
  }).optional()
}).strict();

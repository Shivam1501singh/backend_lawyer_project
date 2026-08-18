import { z } from 'zod';

export const helpRequestSchema = z.object({
  name: z.string({ required_error: 'Name is required.' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name cannot exceed 100 characters.' }),
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase(),
  phoneNumber: z.string({ required_error: 'Phone Number is required.' })
    .trim()
    .min(7, { message: 'Phone number must be at least 7 characters.' })
    .max(20, { message: 'Phone number cannot exceed 20 characters.' }),
  concern: z.string({ required_error: 'Concern is required.' })
    .trim()
    .min(10, { message: 'Concern must be at least 10 characters long.' })
    .max(2000, { message: 'Concern cannot exceed 2000 characters.' })
}).strict();

export const helpLookupSchema = z.object({
  referenceId: z.string({ required_error: 'Reference ID is required.' }).trim().min(1, { message: 'Reference ID cannot be empty.' }),
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase()
}).strict();

export const adminResponseSchema = z.object({
  response: z.string({ required_error: 'Response is required.' })
    .trim()
    .min(1, { message: 'Response cannot be empty.' })
    .max(2000, { message: 'Response cannot exceed 2000 characters.' }),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], {
    errorMap: () => ({ message: 'Please select a valid help request status.' })
  })
}).strict();

import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number({ required_error: 'Rating is required.' })
    .int({ message: 'Rating must be an integer.' })
    .min(0, { message: 'Rating must be at least 0.' })
    .max(5, { message: 'Rating cannot exceed 5.' }),
  reviewText: z.string().trim().max(1000, { message: 'Review comments cannot exceed 1000 characters.' }).optional().nullable()
}).strict();

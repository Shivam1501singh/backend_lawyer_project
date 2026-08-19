import { z } from 'zod';
import { otpSchema, phoneSchema } from './otp.validator.js';

// Indian States and Union Territories
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

export const pincodeSchema = z.string()
  .trim()
  .regex(/^[0-9]{6}$/, { message: 'Pincode must be exactly 6 digits (e.g. 201301).' });

// Base validations
export const passwordSchema = z.string()
  .min(8, { message: 'Password must be at least 8 characters long.' });

export const aadhaarSchema = z.string()
  .trim()
  .regex(/^\d{12}$/, { message: 'Aadhaar number must be exactly 12 digits.' });

export const barCouncilIdSchema = z.string()
  .trim()
  .min(3, { message: 'Bar Council ID must be at least 3 characters.' })
  .max(50, { message: 'Bar Council ID cannot exceed 50 characters.' });

export const languagesSpokenSchema = z.array(z.string().min(1))
  .min(1, { message: 'Please select at least one language.' });

export const genderSchema = z.enum(['Male', 'Female', 'Other', 'Prefer not to say'], {
  errorMap: () => ({ message: 'Please select a valid gender.' })
});

// Registration flow schemas
export const startAdvocateRegistrationSchema = z.object({
  fullName: z.string({ required_error: 'Full Name is required.' })
    .trim()
    .min(2, { message: 'Full Name must be at least 2 characters.' })
    .max(100, { message: 'Full Name cannot exceed 100 characters.' }),
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase(),
  profilePhotoUrl: z.string().url({ message: 'Valid profile photo URL is required.' }).optional().nullable(),
  profilePhotoPublicId: z.string().min(1, { message: 'Profile photo public ID is required.' }).optional().nullable(),
  gender: genderSchema.optional().nullable(),
  registrationId: z.string().uuid().optional()
});

export const sendAdvocateEmailOtpSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase()
});

export const verifyAdvocateEmailOtpSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  otp: otpSchema
});

export const sendAdvocatePhoneOtpSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  phone: phoneSchema
});

export const verifyAdvocatePhoneSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  otp: otpSchema
});

export const completeAdvocateRegistrationSchema = z.object({
  registrationId: z.string().uuid({ message: 'Invalid registration session ID.' }),
  barCouncilId: barCouncilIdSchema,
  aadhaarNumber: aadhaarSchema,
  password: passwordSchema,
  languagesSpoken: languagesSpokenSchema,
  state: z.string().trim().min(2, { message: 'State must be at least 2 characters.' }).max(100),
  city: z.string().trim().min(2, { message: 'City must be at least 2 characters.' }).max(100),
  pincode: pincodeSchema,
  latitude: z.union([z.number(), z.string().transform(v => parseFloat(v))]).optional().nullable(),
  longitude: z.union([z.number(), z.string().transform(v => parseFloat(v))]).optional().nullable()
});

// Login schemas
export const advocateLoginSendOtpSchema = z.object({
  phone: phoneSchema
});

export const advocateLoginVerifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema
});

export const advocateLoginEmailPasswordSchema = z.object({
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .toLowerCase(),
  password: z.string({ required_error: 'Password is required.' })
    .min(8, { message: 'Password must be at least 8 characters long.' })
}).strict();

// Profile update validation schema
export const advocateProfileUpdateSchema = z.object({
  experienceYears: z.number().int().min(0, { message: 'Experience must be a non-negative number.' }).max(80, { message: 'Experience cannot exceed 80 years.' }).optional().nullable(),
  casesWon: z.number().int().min(0, { message: 'Cases won must be a non-negative number.' }).max(100000, { message: 'Cases won cannot exceed 100,000.' }).optional().nullable(),
  practiceAreaIds: z.array(z.string()).min(1, { message: 'Select at least one practice area.' }).optional().nullable(),
  topCourtPractisedId: z.string().min(1, { message: 'Select a top court.' }).optional().nullable(),
  bestPracticeArea: z.string().trim().max(100, { message: 'Best Practice Area cannot exceed 100 characters.' }).optional().nullable(),
  about: z.string().trim().optional().nullable().refine(val => {
    if (!val) return true;
    const words = val.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length <= 50;
  }, { message: 'About section cannot exceed 50 words.' }),
  courtPractice: z.array(z.string().trim()).optional().nullable(),
  completeAddress: z.string().trim().max(500, { message: 'Address cannot exceed 500 characters.' }).optional().nullable(),
  videoCallChargePerMinute: z.number().min(0, { message: 'Video call charge must be a non-negative number.' }).max(100000, { message: 'Video call charge cannot exceed 100,000.' }).optional().nullable(),
  voiceCallChargePerMinute: z.number().min(0, { message: 'Voice call charge must be a non-negative number.' }).max(100000, { message: 'Voice call charge cannot exceed 100,000.' }).optional().nullable(),
  offlineVisitingFee: z.number().min(0, { message: 'Offline visiting fee must be a non-negative number.' }).max(1000000, { message: 'Offline visiting fee cannot exceed 1,000,000.' }).optional().nullable(),
  state: z.string().trim().min(2, { message: 'State must be at least 2 characters.' }).max(100).optional(),
  city: z.string().trim().min(2, { message: 'City must be at least 2 characters.' }).max(100).optional(),
  pincode: pincodeSchema.optional().nullable(),

  // New direct fields
  practiceAreas: z.array(z.string().trim().min(1, { message: 'Practice Area cannot be empty.' }))
    .min(1, { message: 'Select at least one practice area.' })
    .max(20, { message: 'You can select a maximum of 20 practice areas.' })
    .optional()
    .nullable(),
  topCourtPractised: z.string().trim().max(100, { message: 'Top Court Practised name cannot exceed 100 characters.' }).optional().nullable(),

  // Aliases (Section 10 request payload support)
  experience: z.number().int().min(0, { message: 'Experience must be a non-negative number.' }).max(80, { message: 'Experience cannot exceed 80 years.' }).optional().nullable(),
  videoChargePerMinute: z.number().min(0, { message: 'Video charge must be a non-negative number.' }).optional().nullable(),
  voiceChargePerMinute: z.number().min(0, { message: 'Voice charge must be a non-negative number.' }).optional().nullable(),
  languages: z.array(z.string().trim().min(1)).optional().nullable()
}).strict();


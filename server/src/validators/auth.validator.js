import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email address');

// `role` is deliberately absent: zod strips unknown keys, so clients can never self-assign Admin.
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/\d/, 'Password must contain a number'),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

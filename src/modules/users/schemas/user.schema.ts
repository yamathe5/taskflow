import { z } from 'zod';

const roleSchema = z.enum(['admin', 'project_manager', 'developer']);

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must be at most 120 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters'),
  role: roleSchema,
  avatarUrl: z.string().trim().url('Invalid avatar URL').optional().or(z.literal('')),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must be at most 120 characters'),
  email: z.string().trim().email('Invalid email address'),
  role: roleSchema,
  avatarUrl: z.string().trim().url('Invalid avatar URL').nullable().optional().or(z.literal('')),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(120, 'Name must be at most 120 characters'),
  email: z.string().trim().email('Invalid email address'),
  avatarUrl: z.string().trim().url('Invalid avatar URL').nullable().optional().or(z.literal('')),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
import { z } from 'zod';

const roleSchema = z.enum(['admin', 'project_manager', 'developer']);

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('User id must be a positive number'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('User id must be a positive number'),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, 'Name cannot be empty')
        .max(120, 'Name must be at most 120 characters')
        .optional(),
      email: z.string().trim().email('Invalid email address').optional(),
      role: roleSchema.optional(),
      avatarUrl: z.string().trim().url('Invalid avatar URL').nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const updateMyProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, 'Name cannot be empty')
        .max(120, 'Name must be at most 120 characters')
        .optional(),
      email: z.string().trim().email('Invalid email address').optional(),
      avatarUrl: z.string().trim().url('Invalid avatar URL').nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>['body'];
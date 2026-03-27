import { z } from 'zod';

const projectStatusSchema = z.enum(['active', 'archived']);

export const projectIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Project id must be a positive number'),
  }),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Project name is required')
      .max(150, 'Project name must be at most 150 characters'),
    description: z.string().trim().max(5000, 'Description is too long').optional().nullable(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Project id must be a positive number'),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, 'Project name cannot be empty')
        .max(150, 'Project name must be at most 150 characters')
        .optional(),
      description: z.string().trim().max(5000, 'Description is too long').nullable().optional(),
      status: projectStatusSchema.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const archiveProjectSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Project id must be a positive number'),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
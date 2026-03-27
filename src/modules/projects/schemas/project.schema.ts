import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(150, 'Project name must be at most 150 characters'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description is too long')
    .optional()
    .or(z.literal('')),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
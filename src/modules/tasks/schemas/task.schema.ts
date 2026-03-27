import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(150, 'Task title must be at most 150 characters'),

  description: z    
    .string()
    .trim()
    .max(5000, 'Description is too long')
    .optional()
    .or(z.literal('')),

  priority: z.enum(['low', 'medium', 'high', 'critical']),

  projectId: z.coerce
    .number()
    .int()
    .positive('Project id must be a positive number'),

  assignedTo: z
    .union([z.coerce.number().int().positive(), z.literal('')])
    .optional(),

  dueDate: z.string().optional().or(z.literal('')),
});

export type CreateTaskFormInput = z.input<typeof createTaskSchema>;
export type CreateTaskFormValues = z.output<typeof createTaskSchema>;
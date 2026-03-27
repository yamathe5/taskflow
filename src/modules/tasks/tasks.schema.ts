import { z } from 'zod';

const taskStatusSchema = z.enum(['todo', 'in_progress', 'in_review', 'done']);
const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Task id must be a positive number'),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Task title is required')
      .max(150, 'Task title must be at most 150 characters'),
    description: z.string().trim().max(5000, 'Description is too long').optional().nullable(),
    priority: taskPrioritySchema.optional(),
    projectId: z.coerce.number().int().positive('Project id must be a positive number'),
    assignedTo: z.coerce.number().int().positive('Assigned user id must be a positive number').optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Task id must be a positive number'),
  }),
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, 'Task title cannot be empty')
        .max(150, 'Task title must be at most 150 characters')
        .optional(),
      description: z.string().trim().max(5000, 'Description is too long').nullable().optional(),
      priority: taskPrioritySchema.optional(),
      assignedTo: z.coerce.number().int().positive('Assigned user id must be a positive number').nullable().optional(),
      dueDate: z.string().datetime().nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Task id must be a positive number'),
  }),
  body: z.object({
    status: taskStatusSchema,
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>['body'];
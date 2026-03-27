import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  createTaskSchema,
  type CreateTaskFormInput,
  type CreateTaskFormValues,
} from '../schemas/task.schema';
import type { Task } from '../types/task.types';
import type { User } from '../../users/types/user.types';

type TaskFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Task | null;
  onSubmit: (values: CreateTaskFormValues) => Promise<void>;
  isSubmitting: boolean;
  serverError: string;
  projectOptions: Array<{ id: number; name: string }>;
  userOptions: User[];
};

const defaultValues: CreateTaskFormInput = {
  title: '',
  description: '',
  priority: 'medium',
  projectId: '',
  assignedTo: '',
  dueDate: '',
};

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function TaskForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  serverError,
  projectOptions,
  userOptions,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormInput, unknown, CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues,
  });

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      reset({
        title: initialValues.title,
        description: initialValues.description ?? '',
        priority: initialValues.priority,
        projectId: String(initialValues.projectId),
        assignedTo:
          initialValues.assignedTo !== null ? String(initialValues.assignedTo) : '',
        dueDate: toDateTimeLocal(initialValues.dueDate),
      });
    }

    if (mode === 'create') {
      reset(defaultValues);
    }
  }, [initialValues, mode, reset]);

  const submitHandler: SubmitHandler<CreateTaskFormValues> = async (values) => {
    await onSubmit(values);

    if (!serverError && mode === 'create') {
      reset(defaultValues);
    }
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit(submitHandler)}>
      <div className="form-group">
        <label htmlFor={`${mode}-task-title`}>Title</label>
        <input id={`${mode}-task-title`} type="text" {...register('title')} />
        {errors.title && <span className="form-error">{errors.title.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-task-description`}>Description</label>
        <textarea
          id={`${mode}-task-description`}
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <span className="form-error">{errors.description.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-task-priority`}>Priority</label>
        <select id={`${mode}-task-priority`} {...register('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        {errors.priority && (
          <span className="form-error">{errors.priority.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-task-project`}>Project</label>
        <select id={`${mode}-task-project`} {...register('projectId')}>
          <option value="">Select a project</option>
          {projectOptions.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <span className="form-error">{errors.projectId.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-task-assigned-to`}>Assigned user</label>
        <select id={`${mode}-task-assigned-to`} {...register('assignedTo')}>
          <option value="">Unassigned</option>
          {userOptions.map((user) => (
            <option key={user.id} value={user.id}>
              {user.role} - {user.name}
            </option>
          ))}
        </select>
        {errors.assignedTo && (
          <span className="form-error">{errors.assignedTo.message as string}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-task-due-date`}>Due date</label>
        <input
          id={`${mode}-task-due-date`}
          type="datetime-local"
          {...register('dueDate')}
        />
        {errors.dueDate && (
          <span className="form-error">{errors.dueDate.message}</span>
        )}
      </div>

      {serverError && <div className="server-error">{serverError}</div>}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? mode === 'edit'
            ? 'Updating...'
            : 'Creating...'
          : mode === 'edit'
            ? 'Update task'
            : 'Create task'}
      </button>
    </form>
  );
}
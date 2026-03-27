import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { createProjectSchema, type CreateProjectFormValues } from '../schemas/project.schema';
import type { Project } from '../types/project.types';

type ProjectFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Project | null;
  onSubmit: (values: CreateProjectFormValues) => Promise<void>;
  isSubmitting: boolean;
  serverError: string;
};

export function ProjectForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  serverError,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      reset({
        name: initialValues.name,
        description: initialValues.description ?? '',
      });
    }
  }, [initialValues, mode, reset]);

  return (
    <form className="entity-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor={`${mode}-project-name`}>Project name</label>
        <input id={`${mode}-project-name`} type="text" {...register('name')} />
        {errors.name && <span className="form-error">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-project-description`}>Description</label>
        <textarea
          id={`${mode}-project-description`}
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <span className="form-error">{errors.description.message}</span>
        )}
      </div>

      {serverError && <div className="server-error">{serverError}</div>}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? mode === 'edit'
            ? 'Updating...'
            : 'Creating...'
          : mode === 'edit'
            ? 'Update project'
            : 'Create project'}
      </button>
    </form>
  );
}
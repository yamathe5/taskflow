import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useForm } from 'react-hook-form';

import { createProjectSchema, type CreateProjectFormValues } from '../schemas/project.schema';

type ProjectFormProps = {
  onSubmit: (values: CreateProjectFormValues) => Promise<void>;
  isSubmitting: boolean;
  serverError: string;
};

export function ProjectForm({
  onSubmit,
  isSubmitting,
  serverError,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const submitHandler = async (values: CreateProjectFormValues) => {
    await onSubmit(values);

    if (!serverError) {
      reset();
    }
  };

  return (
    <form className="entity-form" onSubmit={handleSubmit(submitHandler)}>
      <div className="form-group">
        <label htmlFor="project-name">Project name</label>
        <input id="project-name" type="text" {...register('name')} />
        {errors.name && <span className="form-error">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="project-description">Description</label>
        <textarea id="project-description" rows={4} {...register('description')} />
        {errors.description && (
          <span className="form-error">{errors.description.message}</span>
        )}
      </div>

      {serverError && <div className="server-error">{serverError}</div>}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create project'}
      </button>
    </form>
  );
}
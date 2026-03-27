import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from '../schemas/user.schema';
import type { User } from '../types/user.types';

type UserFormMode = 'create' | 'edit';

type UserFormProps = {
  mode: UserFormMode;
  initialValues?: User | null;
  onSubmit: (
    values: CreateUserFormValues | UpdateUserFormValues,
  ) => Promise<void>;
  isSubmitting: boolean;
  serverError: string;
};

export function UserForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  serverError,
}: UserFormProps) {
  const isEditMode = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues | UpdateUserFormValues>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: isEditMode
      ? {
          name: initialValues?.name ?? '',
          email: initialValues?.email ?? '',
          role: initialValues?.role ?? 'developer',
          avatarUrl: initialValues?.avatarUrl ?? '',
        }
      : {
          name: '',
          email: '',
          password: '',
          role: 'developer',
          avatarUrl: '',
        },
  });

  useEffect(() => {
    if (isEditMode && initialValues) {
      reset({
        name: initialValues.name,
        email: initialValues.email,
        role: initialValues.role,
        avatarUrl: initialValues.avatarUrl ?? '',
      });
    }
  }, [initialValues, isEditMode, reset]);

  return (
    <form className="entity-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor={`${mode}-user-name`}>Name</label>
        <input id={`${mode}-user-name`} type="text" {...register('name')} />
        {errors.name && <span className="form-error">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-user-email`}>Email</label>
        <input id={`${mode}-user-email`} type="email" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      {!isEditMode && (
        <div className="form-group">
          <label htmlFor="create-user-password">Password</label>
          <input
            id="create-user-password"
            type="password"
            {...register('password' as const)}
          />
          {'password' in errors && errors.password && (
            <span className="form-error">{errors.password.message}</span>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor={`${mode}-user-role`}>Role</label>
        <select id={`${mode}-user-role`} {...register('role')}>
          <option value="admin">admin</option>
          <option value="project_manager">project_manager</option>
          <option value="developer">developer</option>
        </select>
        {errors.role && <span className="form-error">{errors.role.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor={`${mode}-user-avatar`}>Avatar URL</label>
        <input id={`${mode}-user-avatar`} type="text" {...register('avatarUrl')} />
        {errors.avatarUrl && (
          <span className="form-error">{errors.avatarUrl.message as string}</span>
        )}
      </div>

      {serverError && <div className="server-error">{serverError}</div>}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? isEditMode
            ? 'Updating...'
            : 'Creating...'
          : isEditMode
            ? 'Update user'
            : 'Create user'}
      </button>
    </form>
  );
}
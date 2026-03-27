import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from '../schemas/user.schema';
import type { User } from '../types/user.types';

type ProfileFormProps = {
  initialValues: User | null;
  onSubmit: (values: UpdateProfileFormValues) => Promise<void>;
  isSubmitting: boolean;
  serverError: string;
};

export function ProfileForm({
  initialValues,
  onSubmit,
  isSubmitting,
  serverError,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name,
        email: initialValues.email,
        avatarUrl: initialValues.avatarUrl ?? '',
      });
    }
  }, [initialValues, reset]);

  return (
    <form className="entity-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="profile-name">Name</label>
        <input id="profile-name" type="text" {...register('name')} />
        {errors.name && <span className="form-error">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="profile-email">Email</label>
        <input id="profile-email" type="email" {...register('email')} />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="profile-avatar">Avatar URL</label>
        <input id="profile-avatar" type="text" {...register('avatarUrl')} />
        {errors.avatarUrl && (
          <span className="form-error">{errors.avatarUrl.message as string}</span>
        )}
      </div>

      {serverError && <div className="server-error">{serverError}</div>}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  );
}
import axios from 'axios';
import { useEffect, useState } from 'react';

import { getMyProfile, updateMyProfile } from '../api/users.api';
import { ProfileForm } from '../components/ProfileForm';
import type { UpdateProfileFormValues } from '../schemas/user.schema';
import type { User } from '../types/user.types';

export function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await getMyProfile();
      setProfile(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message ?? 'Unable to load profile.');
      } else {
        setErrorMessage('Unexpected error while loading profile.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleSubmit = async (values: UpdateProfileFormValues) => {
    try {
      setIsSaving(true);
      setSaveErrorMessage('');
      setSuccessMessage('');

      const response = await updateMyProfile({
        name: values.name,
        email: values.email,
        avatarUrl: values.avatarUrl?.trim() ? values.avatarUrl.trim() : null,
      });

      setProfile(response.data);
      setSuccessMessage('Profile updated successfully.');

      const authData = localStorage.getItem('auth_data');

      if (authData) {
        try {
          const parsed = JSON.parse(authData) as {
            token: string | null;
            user: User | null;
          };

          localStorage.setItem(
            'auth_data',
            JSON.stringify({
              ...parsed,
              user: response.data,
            }),
          );
        } catch {
          // ignore malformed local storage
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSaveErrorMessage(error.response?.data?.message ?? 'Unable to update profile.');
      } else {
        setSaveErrorMessage('Unexpected error while updating profile.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-card">
        <h2>My Profile</h2>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page-card">
        <h2>My Profile</h2>
        <p className="server-error">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-section__header">
        <h2>My Profile</h2>
        <p>Review and update your personal information.</p>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="page-grid page-grid--two-columns">
        <div className="page-card">
          <h3>Profile Information</h3>
          <ul className="dashboard-list">
            <li>
              <span>Name</span>
              <strong>{profile?.name}</strong>
            </li>
            <li>
              <span>Email</span>
              <strong>{profile?.email}</strong>
            </li>
            <li>
              <span>Role</span>
              <strong>{profile?.role}</strong>
            </li>
          </ul>
        </div>

        <div className="page-card">
          <h3>Edit Profile</h3>
          <ProfileForm
            initialValues={profile}
            onSubmit={handleSubmit}
            isSubmitting={isSaving}
            serverError={saveErrorMessage}
          />
        </div>
      </div>
    </div>
  );
}
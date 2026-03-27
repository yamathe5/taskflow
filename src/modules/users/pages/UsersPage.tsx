import axios from 'axios';
import { useEffect, useState } from 'react';

import { getUsers } from '../api/users.api';
import { UserTable } from '../components/UserTable';
import type { User } from '../types/user.types';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await getUsers();
        setUsers(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErrorMessage(
            error.response?.data?.message ?? 'Unable to load users.',
          );
        } else {
          setErrorMessage('Unexpected error while loading users.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="page-card">
        <h2>Users</h2>
        <p>Loading users...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page-card">
        <h2>Users</h2>
        <p className="server-error">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-section__header">
        <h2>Users</h2>
        <p>Manage active users in the system.</p>
      </div>

      {users.length === 0 ? (
        <div className="page-card">
          <p>No users found.</p>
        </div>
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
}
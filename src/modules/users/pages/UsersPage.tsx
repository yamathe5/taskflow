import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import { Modal } from '../../../shared/components/ui/Modal';
import { createUser, deleteUser, getUsers, updateUser } from '../api/users.api';
import { UserForm } from '../components/UserForm';
import { UserTable } from '../components/UserTable';
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
} from '../schemas/user.schema';
import type { User } from '../types/user.types';

type UserRole = 'admin' | 'project_manager' | 'developer';

type StoredAuthData = {
  token: string | null;
  user: {
    role: UserRole;
  } | null;
};

function getCurrentUserRole(): UserRole | null {
  const rawAuthData = localStorage.getItem('auth_data');

  if (!rawAuthData) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawAuthData) as StoredAuthData;
    return parsed.user?.role ?? null;
  } catch {
    return null;
  }
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [updateErrorMessage, setUpdateErrorMessage] = useState('');

  const userRole = useMemo(() => getCurrentUserRole(), []);
  const canManageUsers = userRole === 'admin';

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message ?? 'Unable to load users.');
      } else {
        setErrorMessage('Unexpected error while loading users.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const showSuccess = async (title: string) => {
    await Swal.fire({
      icon: 'success',
      title,
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const showError = async (message: string) => {
    await Swal.fire({
      icon: 'error',
      title: 'Something went wrong',
      text: message,
    });
  };

  const handleCreateUser = async (
    values: CreateUserFormValues | UpdateUserFormValues,
  ) => {
    const payload = values as CreateUserFormValues;

    try {
      setIsCreating(true);
      setCreateErrorMessage('');

      await createUser({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        avatarUrl: payload.avatarUrl?.trim() ? payload.avatarUrl.trim() : null,
      });

      setIsCreateModalOpen(false);
      await loadUsers();
      await showSuccess('User created successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setCreateErrorMessage(error.response?.data?.message ?? 'Unable to create user.');
      } else {
        setCreateErrorMessage('Unexpected error while creating user.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setUpdateErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (
    values: CreateUserFormValues | UpdateUserFormValues,
  ) => {
    if (!editingUser) {
      return;
    }

    const payload = values as UpdateUserFormValues;

    try {
      setIsUpdating(true);
      setUpdateErrorMessage('');

      await updateUser(editingUser.id, {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        avatarUrl:
          payload.avatarUrl && payload.avatarUrl.trim()
            ? payload.avatarUrl.trim()
            : null,
      });

      setEditingUser(null);
      setIsEditModalOpen(false);
      await loadUsers();
      await showSuccess('User updated successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUpdateErrorMessage(error.response?.data?.message ?? 'Unable to update user.');
      } else {
        setUpdateErrorMessage('Unexpected error while updating user.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete user?',
      text: 'This will soft delete the user account.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#b91c1c',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      await deleteUser(userId);

      if (editingUser?.id === userId) {
        setEditingUser(null);
        setIsEditModalOpen(false);
      }

      await loadUsers();
      await showSuccess('User deleted successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        await showError(error.response?.data?.message ?? 'Unable to delete user.');
      } else {
        await showError('Unexpected error while deleting user.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-card">
        <h2>Users</h2>
        <p>Loading users...</p>
      </div>
    );
  }

  if (errorMessage && !canManageUsers) {
    return (
      <div className="page-card">
        <h2>Users</h2>
        <p className="server-error">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-section__header page-section__header--row">
        <div>
          <h2>Users</h2>
          <p>Manage active users in the system.</p>
        </div>

        {canManageUsers && (
          <button
            className="button"
            type="button"
            onClick={() => {
              setCreateErrorMessage('');
              setIsCreateModalOpen(true);
            }}
          >
            Create user
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="page-card">
          <p>No users found.</p>
        </div>
      ) : (
        <UserTable
          users={users}
          canManageUsers={canManageUsers}
          isDeleting={isDeleting}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteUser}
        />
      )}

      <Modal
        title="Create user"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <UserForm
          mode="create"
          onSubmit={handleCreateUser}
          isSubmitting={isCreating}
          serverError={createErrorMessage}
        />
      </Modal>

      <Modal
        title="Edit user"
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditingUser(null);
          setIsEditModalOpen(false);
        }}
      >
        {editingUser && (
          <UserForm
            mode="edit"
            initialValues={editingUser}
            onSubmit={handleUpdateUser}
            isSubmitting={isUpdating}
            serverError={updateErrorMessage}
          />
        )}
      </Modal>
    </div>
  );
}
import axios from 'axios';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useState } from 'react';

import { Modal } from '../../../shared/components/ui/Modal';
import { getProjects } from '../../projects/api/projects.api';
import type { Project } from '../../projects/types/project.types';
import { getAssignableUsers } from '../../users/api/users.api';
import type { User } from '../../users/types/user.types';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskStatus,
} from '../api/tasks.api';
import { TaskForm } from '../components/TaskForm';
import { TaskTable } from '../components/TaskTable';
import type { CreateTaskFormValues } from '../schemas/task.schema';
import type { Task, TaskStatus } from '../types/task.types';

type UserRole = 'admin' | 'project_manager' | 'developer';

type StoredAuthData = {
  token: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

function getStoredAuthData(): StoredAuthData | null {
  const rawAuthData = localStorage.getItem('auth_data');

  if (!rawAuthData) {
    return null;
  }

  try {
    return JSON.parse(rawAuthData) as StoredAuthData;
  } catch {
    return null;
  }
}

function toApiDate(value?: string): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [updateErrorMessage, setUpdateErrorMessage] = useState('');

  const authData = useMemo(() => getStoredAuthData(), []);
  const currentUser = authData?.user ?? null;
  const userRole = currentUser?.role ?? null;

  const canCreateTask =
    userRole === 'admin' || userRole === 'project_manager' || userRole === 'developer';
  const canManageTasks =
    userRole === 'admin' || userRole === 'project_manager' || userRole === 'developer';
  const canDeleteTasks = userRole === 'admin' || userRole === 'project_manager';

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const baseRequests = [getTasks(), getProjects()] as const;

      if (userRole === 'admin' || userRole === 'project_manager') {
        const [tasksResponse, projectsResponse, usersResponse] = await Promise.all([
          ...baseRequests,
          getAssignableUsers(),
        ]);

        setTasks(tasksResponse.data);
        setProjects(projectsResponse.data);
        setUsers(usersResponse.data);
      } else {
        const [tasksResponse, projectsResponse] = await Promise.all(baseRequests);
        setTasks(tasksResponse.data);
        setProjects(projectsResponse.data);

        if (currentUser) {
          setUsers([
            {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role,
              avatarUrl: currentUser.avatarUrl,
              createdAt: currentUser.createdAt,
              updatedAt: currentUser.updatedAt,
            },
          ]);
        } else {
          setUsers([]);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message ?? 'Unable to load tasks.');
      } else {
        setErrorMessage('Unexpected error while loading tasks.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPageData();
  }, [userRole]);

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

  const handleCreateTask = async (values: CreateTaskFormValues) => {
    try {
      setIsCreating(true);
      setCreateErrorMessage('');

      await createTask({
        title: values.title,
        description: values.description?.trim() ? values.description.trim() : null,
        priority: values.priority,
        projectId: Number(values.projectId),
        assignedTo:
          values.assignedTo !== '' && values.assignedTo !== undefined
            ? Number(values.assignedTo)
            : null,
        dueDate: toApiDate(values.dueDate),
      });

      setIsCreateModalOpen(false);
      await loadPageData();
      await showSuccess('Task created successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setCreateErrorMessage(
          error.response?.data?.message ?? 'Unable to create task.',
        );
      } else {
        setCreateErrorMessage('Unexpected error while creating task.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setUpdateErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (values: CreateTaskFormValues) => {
    if (!editingTask) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateErrorMessage('');

      await updateTask(editingTask.id, {
        title: values.title,
        description: values.description?.trim() ? values.description.trim() : null,
        priority: values.priority,
        assignedTo:
          values.assignedTo !== '' && values.assignedTo !== undefined
            ? Number(values.assignedTo)
            : null,
        dueDate: toApiDate(values.dueDate),
      });

      setEditingTask(null);
      setIsEditModalOpen(false);
      await loadPageData();
      await showSuccess('Task updated successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUpdateErrorMessage(
          error.response?.data?.message ?? 'Unable to update task.',
        );
      } else {
        setUpdateErrorMessage('Unexpected error while updating task.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

    const handleChangeStatus = async (taskId: number, nextStatus: TaskStatus) => {
        const currentTask = tasks.find((task) => task.id === taskId);

        if (!currentTask || currentTask.status === nextStatus) {
        return;
        }

        const result = await Swal.fire({
        icon: 'question',
        title: 'Change task status?',
        text: `The task will change from ${currentTask.status.replace('_', ' ')} to ${nextStatus.replace('_', ' ')}.`,
        showCancelButton: true,
        confirmButtonText: 'Yes, update it',
        cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
        return;
        }

        try {
        setIsUpdatingStatus(true);

        await updateTaskStatus(taskId, nextStatus);
        await loadPageData();
        await showSuccess('Task status updated successfully');
        } catch (error) {
        if (axios.isAxiosError(error)) {
            await showError(
            error.response?.data?.message ?? 'Unable to update task status.',
            );
        } else {
            await showError('Unexpected error while updating task status.');
        }
        } finally {
        setIsUpdatingStatus(false);
        }
  };
  const handleDeleteTask = async (taskId: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete task?',
      text: 'This action cannot be undone.',
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

      await deleteTask(taskId);

      if (editingTask?.id === taskId) {
        setEditingTask(null);
        setIsEditModalOpen(false);
      }

      await loadPageData();
      await showSuccess('Task deleted successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        await showError(error.response?.data?.message ?? 'Unable to delete task.');
      } else {
        await showError('Unexpected error while deleting task.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-card">
        <h2>Tasks</h2>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page-card">
        <h2>Tasks</h2>
        <p className="server-error">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-section__header page-section__header--row">
        <div>
          <h2>Tasks</h2>
          <p>Review tasks according to your current role permissions.</p>
        </div>

        {canCreateTask && (
          <button
            className="button"
            type="button"
            onClick={() => {
              setCreateErrorMessage('');
              setIsCreateModalOpen(true);
            }}
          >
            Create task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="page-card">
          <p>No tasks found.</p>
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          users={users}
          canManageTasks={canManageTasks}
          canDeleteTasks={canDeleteTasks}
          isUpdatingStatus={isUpdatingStatus}
          isDeleting={isDeleting}
          onEdit={handleOpenEdit}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDeleteTask}
        />
      )}

      <Modal
        title="Create task"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <TaskForm
          mode="create"
          onSubmit={handleCreateTask}
          isSubmitting={isCreating}
          serverError={createErrorMessage}
          projectOptions={projects.map((project) => ({
            id: project.id,
            name: project.name,
          }))}
          userOptions={users}
        />
      </Modal>

      <Modal
        title="Edit task"
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditingTask(null);
          setIsEditModalOpen(false);
        }}
      >
        {editingTask && (
          <TaskForm
            mode="edit"
            initialValues={editingTask}
            onSubmit={handleUpdateTask}
            isSubmitting={isUpdating}
            serverError={updateErrorMessage}
            projectOptions={projects.map((project) => ({
              id: project.id,
              name: project.name,
            }))}
            userOptions={users}
          />
        )}
      </Modal>
    </div>
  );
}
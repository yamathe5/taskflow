import axios from 'axios';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useState } from 'react';

import { Modal } from '../../../shared/components/ui/Modal';
import {
  archiveProject,
  createProject,
  deleteProject,
  getProjects,
  restoreProject,
  updateProject,
} from '../api/projects.api';
import { ProjectForm } from '../components/ProjectForm';
import { ProjectTable } from '../components/ProjectTable';
import type { CreateProjectFormValues } from '../schemas/project.schema';
import type { Project } from '../types/project.types';

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

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [updateErrorMessage, setUpdateErrorMessage] = useState('');

  const userRole = useMemo(() => getCurrentUserRole(), []);
  const canCreateProject =
    userRole === 'admin' || userRole === 'project_manager';
  const canManageProjects =
    userRole === 'admin' || userRole === 'project_manager';
  const canDeleteProjects = userRole === 'admin';

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? 'Unable to load projects.',
        );
      } else {
        setErrorMessage('Unexpected error while loading projects.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
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

  const handleCreateProject = async (values: CreateProjectFormValues) => {
    try {
      setIsCreating(true);
      setCreateErrorMessage('');

      await createProject({
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
      });

      setIsCreateModalOpen(false);
      await loadProjects();
      await showSuccess('Project created successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setCreateErrorMessage(
          error.response?.data?.message ?? 'Unable to create project.',
        );
      } else {
        setCreateErrorMessage('Unexpected error while creating project.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setUpdateErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (values: CreateProjectFormValues) => {
    if (!editingProject) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateErrorMessage('');

      await updateProject(editingProject.id, {
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
      });

      setEditingProject(null);
      setIsEditModalOpen(false);
      await loadProjects();
      await showSuccess('Project updated successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUpdateErrorMessage(
          error.response?.data?.message ?? 'Unable to update project.',
        );
      } else {
        setUpdateErrorMessage('Unexpected error while updating project.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchiveProject = async (projectId: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Archive project?',
      text: 'You can restore it later.',
      showCancelButton: true,
      confirmButtonText: 'Yes, archive it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setIsArchiving(true);

      await archiveProject(projectId);
      await loadProjects();
      await showSuccess('Project archived successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        await showError(error.response?.data?.message ?? 'Unable to archive project.');
      } else {
        await showError('Unexpected error while archiving project.');
      }
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestoreProject = async (projectId: number) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Restore project?',
      text: 'The project will become active again.',
      showCancelButton: true,
      confirmButtonText: 'Yes, restore it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setIsArchiving(true);

      await restoreProject(projectId);
      await loadProjects();
      await showSuccess('Project restored successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        await showError(error.response?.data?.message ?? 'Unable to restore project.');
      } else {
        await showError('Unexpected error while restoring project.');
      }
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete project?',
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

      await deleteProject(projectId);

      if (editingProject?.id === projectId) {
        setEditingProject(null);
        setIsEditModalOpen(false);
      }

      await loadProjects();
      await showSuccess('Project deleted successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        await showError(error.response?.data?.message ?? 'Unable to delete project.');
      } else {
        await showError('Unexpected error while deleting project.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-card">
        <h2>Projects</h2>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (errorMessage && !canManageProjects && !canDeleteProjects) {
    return (
      <div className="page-card">
        <h2>Projects</h2>
        <p className="server-error">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-section__header page-section__header--row">
        <div>
          <h2>Projects</h2>
          <p>Manage and review registered projects.</p>
        </div>

        {canCreateProject && (
          <button
            className="button"
            type="button"
            onClick={() => {
              setCreateErrorMessage('');
              setIsCreateModalOpen(true);
            }}
          >
            Create project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="page-card">
          <p>No projects found.</p>
        </div>
      ) : (
        <ProjectTable
          projects={projects}
          canManageProjects={canManageProjects}
          canDeleteProjects={canDeleteProjects}
          isArchiving={isArchiving}
          isDeleting={isDeleting}
          onEdit={handleOpenEdit}
          onArchive={handleArchiveProject}
          onRestore={handleRestoreProject}
          onDelete={handleDeleteProject}
        />
      )}

      <Modal
        title="Create project"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <ProjectForm
          mode="create"
          onSubmit={handleCreateProject}
          isSubmitting={isCreating}
          serverError={createErrorMessage}
        />
      </Modal>

      <Modal
        title="Edit project"
        isOpen={isEditModalOpen}
        onClose={() => {
          setEditingProject(null);
          setIsEditModalOpen(false);
        }}
      >
        {editingProject && (
          <ProjectForm
            mode="edit"
            initialValues={editingProject}
            onSubmit={handleUpdateProject}
            isSubmitting={isUpdating}
            serverError={updateErrorMessage}
          />
        )}
      </Modal>
    </div>
  );
}
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import {
  archiveProject,
  createProject,
  deleteProject,
  getProjects,
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [updateErrorMessage, setUpdateErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleCreateProject = async (values: CreateProjectFormValues) => {
    try {
      setIsCreating(true);
      setCreateErrorMessage('');
      setSuccessMessage('');

      await createProject({
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
      });

      setSuccessMessage('Project created successfully.');
      await loadProjects();
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

  const handleUpdateProject = async (values: CreateProjectFormValues) => {
    if (!editingProject) {
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateErrorMessage('');
      setSuccessMessage('');

      await updateProject(editingProject.id, {
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : null,
      });

      setSuccessMessage('Project updated successfully.');
      setEditingProject(null);
      await loadProjects();
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
    const confirmed = window.confirm('Are you sure you want to archive this project?');

    if (!confirmed) {
      return;
    }

    try {
      setIsArchiving(true);
      setSuccessMessage('');

      await archiveProject(projectId);

      setSuccessMessage('Project archived successfully.');
      await loadProjects();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? 'Unable to archive project.',
        );
      } else {
        setErrorMessage('Unexpected error while archiving project.');
      }
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this project?');

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setSuccessMessage('');

      await deleteProject(projectId);

      if (editingProject?.id === projectId) {
        setEditingProject(null);
      }

      setSuccessMessage('Project deleted successfully.');
      await loadProjects();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? 'Unable to delete project.',
        );
      } else {
        setErrorMessage('Unexpected error while deleting project.');
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
      <div className="page-section__header">
        <h2>Projects</h2>
        <p>Manage and review registered projects.</p>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}

      {canCreateProject && (
        <div className="page-grid page-grid--two-columns">
          <div className="page-card">
            <h3>Create project</h3>
            <p className="muted-text">
              Only admin and project manager roles can create projects.
            </p>

            <ProjectForm
              mode="create"
              onSubmit={handleCreateProject}
              isSubmitting={isCreating}
              serverError={createErrorMessage}
            />
          </div>

          <div className="page-card">
            <h3>Edit project</h3>
            <p className="muted-text">
              {editingProject
                ? `Editing project #${editingProject.id}`
                : 'Select a project from the table to edit.'}
            </p>

            {editingProject ? (
              <ProjectForm
                mode="edit"
                initialValues={editingProject}
                onSubmit={handleUpdateProject}
                isSubmitting={isUpdating}
                serverError={updateErrorMessage}
              />
            ) : (
              <p className="muted-text">No project selected.</p>
            )}
          </div>
        </div>
      )}

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
          onEdit={setEditingProject}
          onArchive={handleArchiveProject}
          onDelete={handleDeleteProject}
        />
      )}
    </div>
  );
}
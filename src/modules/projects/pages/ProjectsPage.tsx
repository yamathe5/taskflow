import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

import { createProject, getProjects } from '../api/projects.api';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const userRole = useMemo(() => getCurrentUserRole(), []);
  const canCreateProject =
    userRole === 'admin' || userRole === 'project_manager';

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

  if (isLoading) {
    return (
      <div className="page-card">
        <h2>Projects</h2>
        <p>Loading projects...</p>
      </div>
    );
  }

  if (errorMessage) {
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

      {canCreateProject && (
        <div className="page-card">
          <h3>Create project</h3>
          <p className="muted-text">
            Only admin and project manager roles can create projects.
          </p>

          {successMessage && <div className="success-message">{successMessage}</div>}

          <ProjectForm
            onSubmit={handleCreateProject}
            isSubmitting={isCreating}
            serverError={createErrorMessage}
          />
        </div>
      )}

      {projects.length === 0 ? (
        <div className="page-card">
          <p>No projects found.</p>
        </div>
      ) : (
        <ProjectTable projects={projects} />
      )}
    </div>
  );
}
import axios from 'axios';
import { useEffect, useState } from 'react';

import { getProjects } from '../api/projects.api';
import { ProjectTable } from '../components/ProjectTable';
import type { Project } from '../types/project.types';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadProjects() {
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
    }

    void loadProjects();
  }, []);

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
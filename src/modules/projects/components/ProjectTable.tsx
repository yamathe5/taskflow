import type { Project } from '../types/project.types';

type ProjectTableProps = {
  projects: Project[];
};

export function ProjectTable({ projects }: ProjectTableProps) {
  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Owner ID</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.name}</td>
              <td>
                <span
                  className={
                    project.status === 'active'
                      ? 'status-badge status-badge--active'
                      : 'status-badge status-badge--archived'
                  }
                >
                  {project.status}
                </span>
              </td>
              <td>{project.ownerId}</td>
              <td>{project.description ?? 'No description'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
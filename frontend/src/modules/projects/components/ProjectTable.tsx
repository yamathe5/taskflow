import type { Project } from '../types/project.types';

type ProjectTableProps = {
  projects: Project[];
  canManageProjects: boolean;
  canDeleteProjects: boolean;
  isArchiving: boolean;
  isDeleting: boolean;
  onEdit: (project: Project) => void;
  onArchive: (projectId: number) => Promise<void>;
  onRestore: (projectId: number) => Promise<void>;
  onDelete: (projectId: number) => Promise<void>;
};

export function ProjectTable({
  projects,
  canManageProjects,
  canDeleteProjects,
  isArchiving,
  isDeleting,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: ProjectTableProps) {
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
            {(canManageProjects || canDeleteProjects) && <th>Actions</th>}
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

              {(canManageProjects || canDeleteProjects) && (
                <td className="table-actions">
                  {canManageProjects && (
                    <>
                      <button
                        className="button button--small button--secondary"
                        type="button"
                        onClick={() => onEdit(project)}
                      >
                        Edit
                      </button>

                      {project.status === 'active' ? (
                        <button
                          className="button button--small"
                          type="button"
                          disabled={isArchiving}
                          onClick={() => void onArchive(project.id)}
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          className="button button--small button--success"
                          type="button"
                          disabled={isArchiving}
                          onClick={() => void onRestore(project.id)}
                        >
                          Restore
                        </button>
                      )}
                    </>
                  )}

                  {canDeleteProjects && (
                    <button
                      className="button button--small button--danger"
                      type="button"
                      disabled={isDeleting}
                      onClick={() => void onDelete(project.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
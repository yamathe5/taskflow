import type { User } from '../types/user.types';

type UserTableProps = {
  users: User[];
  canManageUsers: boolean;
  isDeleting: boolean;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => Promise<void>;
};

export function UserTable({
  users,
  canManageUsers,
  isDeleting,
  onEdit,
  onDelete,
}: UserTableProps) {
  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Avatar</th>
            {canManageUsers && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.avatarUrl ? 'Yes' : 'No'}</td>

              {canManageUsers && (
                <td className="table-actions">
                  <button
                    className="button button--small button--secondary"
                    type="button"
                    onClick={() => onEdit(user)}
                  >
                    Edit
                  </button>

                  <button
                    className="button button--small button--danger"
                    type="button"
                    disabled={isDeleting}
                    onClick={() => void onDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
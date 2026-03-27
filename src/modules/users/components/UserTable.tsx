import type { User } from '../types/user.types';

type UserTableProps = {
  users: User[];
};

export function UserTable({ users }: UserTableProps) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
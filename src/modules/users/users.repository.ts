import type { QueryResult } from 'pg';

import { pool } from '../../config/db';

type UserRole = 'admin' | 'project_manager' | 'developer';

export type UserRow = {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type UpdateUserParams = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
};

export class UsersRepository {
  async findAllActive(): Promise<UserRow[]> {
    const query = `
      SELECT
        id,
        name,
        email,
        role,
        avatar_url AS "avatarUrl",
        deleted_at AS "deletedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      WHERE deleted_at IS NULL
      ORDER BY id ASC;
    `;

    const result: QueryResult<UserRow> = await pool.query(query);
    return result.rows;
  }

  async findActiveById(id: number): Promise<UserRow | null> {
    const query = `
      SELECT
        id,
        name,
        email,
        role,
        avatar_url AS "avatarUrl",
        deleted_at AS "deletedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      WHERE id = $1
        AND deleted_at IS NULL
      LIMIT 1;
    `;

    const result: QueryResult<UserRow> = await pool.query(query, [id]);
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const query = `
      SELECT
        id,
        name,
        email,
        role,
        avatar_url AS "avatarUrl",
        deleted_at AS "deletedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
      WHERE email = $1
      LIMIT 1;
    `;

    const result: QueryResult<UserRow> = await pool.query(query, [email]);
    return result.rows[0] ?? null;
  }

  async updateUser(params: UpdateUserParams): Promise<UserRow> {
    const query = `
      UPDATE users
      SET
        name = $2,
        email = $3,
        role = $4,
        avatar_url = $5
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING
        id,
        name,
        email,
        role,
        avatar_url AS "avatarUrl",
        deleted_at AS "deletedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt";
    `;

    const values = [
      params.id,
      params.name,
      params.email,
      params.role,
      params.avatarUrl,
    ];

    const result: QueryResult<UserRow> = await pool.query(query, values);
    return result.rows[0];
  }

  async softDeleteUser(id: number): Promise<boolean> {
    const query = `
      UPDATE users
      SET deleted_at = NOW()
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING id;
    `;

    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
import type { QueryResult } from 'pg';

import { pool } from '../../config/db';

type UserRow = {
  id: number;
  name: string;
  email: string;
  passwordhash: string;
  role: 'admin' | 'project_manager' | 'developer';
  avatarurl: string | null;
  deletedat: Date | null;
  createdat: Date;
  updatedat: Date;
};

type CreateUserParams = {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'project_manager' | 'developer';
  avatarUrl?: string | null;
};

export class AuthRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const query = `
      SELECT
        id,
        name,
        email,
        password_hash AS "passwordhash",
        role,
        avatar_url AS "avatarurl",
        deleted_at AS "deletedat",
        created_at AS "createdat",
        updated_at AS "updatedat"
      FROM users
      WHERE email = $1
      LIMIT 1;
    `;

    const result: QueryResult<UserRow> = await pool.query(query, [email]);

    return result.rows[0] ?? null;
  }

  async createUser(params: CreateUserParams): Promise<Omit<UserRow, 'passwordhash'>> {
    const query = `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        avatar_url
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        email,
        role,
        avatar_url AS "avatarurl",
        deleted_at AS "deletedat",
        created_at AS "createdat",
        updated_at AS "updatedat";
    `;

    const values = [
      params.name,
      params.email,
      params.passwordHash,
      params.role,
      params.avatarUrl ?? null,
    ];

    const result = await pool.query<Omit<UserRow, 'passwordhash'>>(query, values);

    return result.rows[0];
  }
}
import type { QueryResult } from 'pg';

import { pool } from '../../config/db';

type ProjectStatus = 'active' | 'archived';

export type ProjectRow = {
  id: number | string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  ownerId: number | string;
  createdAt: Date;
  updatedAt: Date;
};

type CreateProjectParams = {
  name: string;
  description: string | null;
  ownerId: number;
};

type UpdateProjectParams = {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
};

export class ProjectsRepository {
  async createProject(params: CreateProjectParams): Promise<ProjectRow> {
    const query = `
      INSERT INTO projects (
        name,
        description,
        status,
        owner_id
      )
      VALUES ($1, $2, 'active', $3)
      RETURNING
        id,
        name,
        description,
        status,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt";
    `;

    const values = [params.name, params.description, params.ownerId];
    const result: QueryResult<ProjectRow> = await pool.query(query, values);

    return result.rows[0];
  }

  async findAll(): Promise<ProjectRow[]> {
    const query = `
      SELECT
        id,
        name,
        description,
        status,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM projects
      ORDER BY id ASC;
    `;

    const result: QueryResult<ProjectRow> = await pool.query(query);
    return result.rows;
  }

  async findByOwnerId(ownerId: number): Promise<ProjectRow[]> {
    const query = `
      SELECT
        id,
        name,
        description,
        status,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM projects
      WHERE owner_id = $1
      ORDER BY id ASC;
    `;

    const result: QueryResult<ProjectRow> = await pool.query(query, [ownerId]);
    return result.rows;
  }

  async findAssignedToDeveloper(userId: number): Promise<ProjectRow[]> {
    const query = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.description,
        p.status,
        p.owner_id AS "ownerId",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt"
      FROM projects p
      INNER JOIN tasks t
        ON t.project_id = p.id
      WHERE t.assigned_to = $1
      ORDER BY p.id ASC;
    `;

    const result: QueryResult<ProjectRow> = await pool.query(query, [userId]);
    return result.rows;
  }

  async findById(id: number): Promise<ProjectRow | null> {
    const query = `
      SELECT
        id,
        name,
        description,
        status,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM projects
      WHERE id = $1
      LIMIT 1;
    `;

    const result: QueryResult<ProjectRow> = await pool.query(query, [id]);
    return result.rows[0] ?? null;
  }

  async existsDeveloperAssignment(projectId: number, userId: number): Promise<boolean> {
    const query = `
      SELECT 1
      FROM tasks
      WHERE project_id = $1
        AND assigned_to = $2
      LIMIT 1;
    `;

    const result = await pool.query(query, [projectId, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateProject(params: UpdateProjectParams): Promise<ProjectRow> {
    const query = `
      UPDATE projects
      SET
        name = $2,
        description = $3,
        status = $4
      WHERE id = $1
      RETURNING
        id,
        name,
        description,
        status,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt";
    `;

    const values = [params.id, params.name, params.description, params.status];
    const result: QueryResult<ProjectRow> = await pool.query(query, values);

    return result.rows[0];
  }

  async archiveProject(id: number): Promise<ProjectRow | null> {
    const query = `
      UPDATE projects
      SET status = 'archived'
      WHERE id = $1
      RETURNING
        id,
        name,
        description,
        status,
        owner_id AS "ownerId",
        created_at AS "createdAt",
        updated_at AS "updatedAt";
    `;

    const result: QueryResult<ProjectRow> = await pool.query(query, [id]);
    return result.rows[0] ?? null;
  }

  async deleteProject(id: number): Promise<boolean> {
    const query = `
      DELETE FROM projects
      WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
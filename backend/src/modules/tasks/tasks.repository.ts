import type { QueryResult } from 'pg';

import { pool } from '../../config/db';

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskRow = {
  id: number | string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number | string;
  assignedTo: number | string | null;
  createdBy: number | string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreateTaskParams = {
  title: string;
  description: string | null;
  priority: TaskPriority;
  projectId: number;
  assignedTo: number | null;
  createdBy: number;
  dueDate: Date | null;
};

type UpdateTaskParams = {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  assignedTo: number | null;
  dueDate: Date | null;
};

export class TasksRepository {
  async findAll(): Promise<TaskRow[]> {
    const query = `
      SELECT
        id,
        title,
        description,
        status,
        priority,
        project_id AS "projectId",
        assigned_to AS "assignedTo",
        created_by AS "createdBy",
        due_date AS "dueDate",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tasks
      ORDER BY id ASC;
    `;

    const result: QueryResult<TaskRow> = await pool.query(query);
    return result.rows;
  }

  async findByAssignedTo(userId: number): Promise<TaskRow[]> {
    const query = `
      SELECT
        id,
        title,
        description,
        status,
        priority,
        project_id AS "projectId",
        assigned_to AS "assignedTo",
        created_by AS "createdBy",
        due_date AS "dueDate",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tasks
      WHERE assigned_to = $1
      ORDER BY id ASC;
    `;

    const result: QueryResult<TaskRow> = await pool.query(query, [userId]);
    return result.rows;
  }

  async findByProjectOwnerId(ownerId: number): Promise<TaskRow[]> {
    const query = `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.project_id AS "projectId",
        t.assigned_to AS "assignedTo",
        t.created_by AS "createdBy",
        t.due_date AS "dueDate",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt"
      FROM tasks t
      INNER JOIN projects p
        ON p.id = t.project_id
      WHERE p.owner_id = $1
      ORDER BY t.id ASC;
    `;

    const result: QueryResult<TaskRow> = await pool.query(query, [ownerId]);
    return result.rows;
  }

  async findById(id: number): Promise<TaskRow | null> {
    const query = `
      SELECT
        id,
        title,
        description,
        status,
        priority,
        project_id AS "projectId",
        assigned_to AS "assignedTo",
        created_by AS "createdBy",
        due_date AS "dueDate",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tasks
      WHERE id = $1
      LIMIT 1;
    `;

    const result: QueryResult<TaskRow> = await pool.query(query, [id]);
    return result.rows[0] ?? null;
  }

  async createTask(params: CreateTaskParams): Promise<TaskRow> {
    const query = `
      INSERT INTO tasks (
        title,
        description,
        status,
        priority,
        project_id,
        assigned_to,
        created_by,
        due_date
      )
      VALUES ($1, $2, 'todo', $3, $4, $5, $6, $7)
      RETURNING
        id,
        title,
        description,
        status,
        priority,
        project_id AS "projectId",
        assigned_to AS "assignedTo",
        created_by AS "createdBy",
        due_date AS "dueDate",
        created_at AS "createdAt",
        updated_at AS "updatedAt";
    `;

    const values = [
      params.title,
      params.description,
      params.priority,
      params.projectId,
      params.assignedTo,
      params.createdBy,
      params.dueDate,
    ];

    const result: QueryResult<TaskRow> = await pool.query(query, values);
    return result.rows[0];
  }

  async updateTask(params: UpdateTaskParams): Promise<TaskRow> {
    const query = `
      UPDATE tasks
      SET
        title = $2,
        description = $3,
        priority = $4,
        assigned_to = $5,
        due_date = $6
      WHERE id = $1
      RETURNING
        id,
        title,
        description,
        status,
        priority,
        project_id AS "projectId",
        assigned_to AS "assignedTo",
        created_by AS "createdBy",
        due_date AS "dueDate",
        created_at AS "createdAt",
        updated_at AS "updatedAt";
    `;

    const values = [
      params.id,
      params.title,
      params.description,
      params.priority,
      params.assignedTo,
      params.dueDate,
    ];

    const result: QueryResult<TaskRow> = await pool.query(query, values);
    return result.rows[0];
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<TaskRow | null> {
    const query = `
      UPDATE tasks
      SET status = $2
      WHERE id = $1
      RETURNING
        id,
        title,
        description,
        status,
        priority,
        project_id AS "projectId",
        assigned_to AS "assignedTo",
        created_by AS "createdBy",
        due_date AS "dueDate",
        created_at AS "createdAt",
        updated_at AS "updatedAt";
    `;

    const result: QueryResult<TaskRow> = await pool.query(query, [id, status]);
    return result.rows[0] ?? null;
  }

  async deleteTask(id: number): Promise<boolean> {
    const query = `
      DELETE FROM tasks
      WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
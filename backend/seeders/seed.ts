import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

type UserRole = 'admin' | 'project_manager' | 'developer';
type ProjectStatus = 'active' | 'archived';
type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required in .env');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function upsertUser(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string | null;
}) {
  const passwordHash = await hashPassword(params.password);

  const query = `
    INSERT INTO users (
      name,
      email,
      password_hash,
      role,
      avatar_url
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email)
    DO UPDATE SET
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role,
      avatar_url = EXCLUDED.avatar_url,
      deleted_at = NULL,
      updated_at = NOW()
    RETURNING id, name, email, role;
  `;

  const values = [
    params.name,
    params.email.toLowerCase(),
    passwordHash,
    params.role,
    params.avatarUrl ?? null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function upsertProject(params: {
  name: string;
  description: string | null;
  status: ProjectStatus;
  ownerId: number;
}) {
  const existingProject = await pool.query(
    `SELECT id FROM projects WHERE name = $1 LIMIT 1;`,
    [params.name],
  );

  if (existingProject.rowCount && existingProject.rows[0]) {
    const updateQuery = `
      UPDATE projects
      SET
        description = $2,
        status = $3,
        owner_id = $4,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, status;
    `;

    const updateResult = await pool.query(updateQuery, [
      existingProject.rows[0].id,
      params.description,
      params.status,
      params.ownerId,
    ]);

    return updateResult.rows[0];
  }

  const insertQuery = `
    INSERT INTO projects (
      name,
      description,
      status,
      owner_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, status;
  `;

  const insertResult = await pool.query(insertQuery, [
    params.name,
    params.description,
    params.status,
    params.ownerId,
  ]);

  return insertResult.rows[0];
}

async function upsertTask(params: {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assignedTo: number | null;
  createdBy: number;
  dueDate: string | null;
}) {
  const existingTask = await pool.query(
    `SELECT id FROM tasks WHERE title = $1 LIMIT 1;`,
    [params.title],
  );

  if (existingTask.rowCount && existingTask.rows[0]) {
    const updateQuery = `
      UPDATE tasks
      SET
        description = $2,
        status = $3,
        priority = $4,
        project_id = $5,
        assigned_to = $6,
        created_by = $7,
        due_date = $8,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, title, status, priority;
    `;

    const updateResult = await pool.query(updateQuery, [
      existingTask.rows[0].id,
      params.description,
      params.status,
      params.priority,
      params.projectId,
      params.assignedTo,
      params.createdBy,
      params.dueDate,
    ]);

    return updateResult.rows[0];
  }

  const insertQuery = `
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
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, title, status, priority;
  `;

  const insertResult = await pool.query(insertQuery, [
    params.title,
    params.description,
    params.status,
    params.priority,
    params.projectId,
    params.assignedTo,
    params.createdBy,
    params.dueDate,
  ]);

  return insertResult.rows[0];
}

async function runSeeder() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const admin = await upsertUser({
      name: 'Admin User',
      email: 'admin@taskflow.com',
      password: 'Admin123!',
      role: 'admin',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    });

    const maria = await upsertUser({
      name: 'María García',
      email: 'maria@taskflow.com',
      password: 'Maria123!',
      role: 'project_manager',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
    });

    const carlos = await upsertUser({
      name: 'Carlos López',
      email: 'carlos@taskflow.com',
      password: 'Carlos123!',
      role: 'developer',
      avatarUrl: 'https://i.pravatar.cc/150?img=8',
    });

    // Extra developer to satisfy "tasks assigned to different users"
    const ana = await upsertUser({
      name: 'Ana Torres',
      email: 'ana@taskflow.com',
      password: 'Ana12345!',
      role: 'developer',
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
    });

    const projectA = await upsertProject({
      name: 'TaskFlow Web Platform',
      description: 'Main platform for task and project management.',
      status: 'active',
      ownerId: Number(maria.id),
    });

    const projectB = await upsertProject({
      name: 'Legacy Support Migration',
      description: 'Archived project used for historical task review.',
      status: 'archived',
      ownerId: Number(maria.id),
    });

    await upsertTask({
      title: 'Design login page',
      description: 'Create responsive login UI and validation states.',
      status: 'todo',
      priority: 'medium',
      projectId: Number(projectA.id),
      assignedTo: Number(carlos.id),
      createdBy: Number(maria.id),
      dueDate: '2026-04-02T15:00:00.000Z',
    });

    await upsertTask({
      title: 'Implement JWT authentication',
      description: 'Connect login form with backend auth flow.',
      status: 'in_progress',
      priority: 'high',
      projectId: Number(projectA.id),
      assignedTo: Number(carlos.id),
      createdBy: Number(maria.id),
      dueDate: '2026-04-03T18:00:00.000Z',
    });

    await upsertTask({
      title: 'Create dashboard cards',
      description: 'Add role-aware summary cards for admin, PM, and developer.',
      status: 'in_review',
      priority: 'medium',
      projectId: Number(projectA.id),
      assignedTo: Number(ana.id),
      createdBy: Number(maria.id),
      dueDate: '2026-04-04T17:00:00.000Z',
    });

    await upsertTask({
      title: 'Seed initial database data',
      description: 'Prepare initial records for technical evaluation.',
      status: 'done',
      priority: 'low',
      projectId: Number(projectA.id),
      assignedTo: Number(ana.id),
      createdBy: Number(admin.id),
      dueDate: '2026-03-28T12:00:00.000Z',
    });

    await upsertTask({
      title: 'Review archived project tasks',
      description: 'Validate historical data before closing project.',
      status: 'done',
      priority: 'critical',
      projectId: Number(projectB.id),
      assignedTo: Number(carlos.id),
      createdBy: Number(maria.id),
      dueDate: '2026-03-25T10:00:00.000Z',
    });

    await client.query('COMMIT');

    console.log('Seeder executed successfully.');
    console.log('Users created/updated:');
    console.log('- admin@taskflow.com / Admin123!');
    console.log('- maria@taskflow.com / Maria123!');
    console.log('- carlos@taskflow.com / Carlos123!');
    console.log('- ana@taskflow.com / Ana12345!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeder failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void runSeeder();
import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
});

export async function connectDatabase(): Promise<void> {
  const client = await pool.connect();
    console.log('Database connected successfully');

  try {
    await client.query('SELECT 1');
    console.log('Database connected successfully');
  } finally {
    client.release();
  }
}
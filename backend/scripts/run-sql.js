const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required in .env');
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  const fileArg = process.argv[2];

  if (!fileArg) {
    throw new Error('You must provide a SQL file path');
  }

  const absolutePath = path.resolve(process.cwd(), fileArg);
  const sql = fs.readFileSync(absolutePath, 'utf8');

  await client.connect();
  await client.query(sql);
  await client.end();

  console.log(`SQL executed successfully: ${fileArg}`);
}

run().catch((error) => {
  console.error('SQL execution failed:', error);
  process.exit(1);
});
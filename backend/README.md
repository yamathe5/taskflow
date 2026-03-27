# TaskFlow Pro Backend

Backend API for TaskFlow Pro built with Node.js, Express, TypeScript, and PostgreSQL.

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Zod
- JWT
- bcryptjs

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d
```

## Run

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

## Seeders

Seed file:

```text
seeders/001_seed_initial_data.sql
```

Run it with PostgreSQL tools such as pgAdmin Query Tool or `psql`.

Example:

```bash
psql -U postgres -d taskflow -f seeders/001_seed_initial_data.sql
```

## Test Users

After running the seeder:

- Admin: `admin@test.com` / `123456`
- Project Manager: `pm@test.com` / `123456`
- Developer: `dev@test.com` / `123456`

## Base URL

```text
http://localhost:3000/api/v1
```

## Main Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Users
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Projects
- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `PATCH /projects/:id`
- `PATCH /projects/:id/archive`
- `DELETE /projects/:id`

### Tasks
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/status`
- `DELETE /tasks/:id`

## Auth Header

Protected routes require:

```text
Authorization: Bearer <token>
```

## Notes

- Users use soft delete with `deleted_at`.
- Projects currently use hard delete.
- Tasks currently use hard delete.
- Role handling was kept simple for the technical test.

# TaskFlow Pro Backend

Backend API for TaskFlow Pro built with Node.js, Express, TypeScript, and PostgreSQL.

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Zod
- JWT
- bcryptjs

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d
```

## Run

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

## Seeders

Seed file:

```text
seeders/001_seed_initial_data.sql
```

Run it with PostgreSQL tools such as pgAdmin Query Tool or `psql`.

Example:

```bash
psql -U postgres -d taskflow -f seeders/001_seed_initial_data.sql
```

## Test Users

After running the seeder:

- Admin: `admin@test.com` / `123456`
- Project Manager: `pm@test.com` / `123456`
- Developer: `dev@test.com` / `123456`

## Base URL

```text
http://localhost:3000/api
```

## Main Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Users
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Projects
- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `PATCH /projects/:id`
- `PATCH /projects/:id/archive`
- `DELETE /projects/:id`

### Tasks
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/status`
- `DELETE /tasks/:id`

## Auth Header

Protected routes require:

```text
Authorization: Bearer <token>
```

## Notes

- Users use soft delete with `deleted_at`.
- Projects currently use hard delete.
- Tasks currently use hard delete.
- Role handling was kept simple for the technical test.

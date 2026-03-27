# TaskFlow Pro

TaskFlow Pro is a full-stack task and project management application built for the technical assessment. It includes JWT authentication, role-based access control, CRUD flows for users, projects, and tasks, and a role-aware dashboard.

## Stack

### Backend
- Node.js
- TypeScript
- Express
- PostgreSQL
- Zod
- JWT
- bcryptjs

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- React Hook Form
- SweetAlert2

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Project Structure

```text
taskflow/
  backend/
    migrations/
    scripts/
    seeders/
    src/
      config/
      modules/
        auth/
        users/
        projects/
        tasks/
      shared/
        errors/
        middleware/
        utils/
      app.ts
      server.ts
    .env.example
    package.json

  frontend/
    src/
      app/
      modules/
        auth/
        users/
        projects/
        tasks/
      pages/
      shared/
      styles/
    package.json

  docs/
    ARCHITECTURE.md
```

## Backend Setup

1. Go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Update the database connection in `.env`.

### Required Backend Environment Variables

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/taskflow
DB_SSL=false
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
ALLOWED_ORIGIN=http://localhost:5173
```

## Database Migration and Seeder

Run the initial migration:

```bash
npm run db:migrate
```

Run the seed:

```bash
npm run seed
```

Or run both with:

```bash
npm run db:setup
```

## Run Backend in Development

```bash
npm run dev
```

Backend base URL:

```text
http://localhost:3000/api/v1
```

## Frontend Setup

1. Open another terminal and go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Seeder Credentials

### Admin
- Email: `admin@taskflow.com`
- Password: `Admin123!`

### Project Manager
- Email: `maria@taskflow.com`
- Password: `Maria123!`

### Developer
- Email: `carlos@taskflow.com`
- Password: `Carlos123!`

### Extra Developer
- Email: `ana@taskflow.com`
- Password: `Ana12345!`

## Main API Areas

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

- `GET /api/v1/users`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:id`
- `PATCH /api/v1/projects/:id`
- `PATCH /api/v1/projects/:id/archive`
- `DELETE /api/v1/projects/:id`

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id/status`
- `DELETE /api/v1/tasks/:id`

## Notes

- The backend uses standardized API responses with `success`, `message`, `data`, and `errors` where applicable.
- The project includes migrations and seeders to simplify evaluator setup.
- Some advanced requirements are left as future improvements, such as full pagination metadata on every list endpoint, complete Swagger/OpenAPI integration, and automated tests.

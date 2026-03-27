# ARCHITECTURE.md

# TaskFlow Pro — Architecture Overview

## 1. Objective

TaskFlow Pro is a role-based task and project management system built for the technical assessment.

The solution includes:

- JWT authentication
- role-based authorization
- CRUD flows for users, projects, and tasks
- role-aware dashboard
- validation and centralized error handling
- PostgreSQL relational persistence

The architecture was designed to be modular, readable, and maintainable, while keeping the implementation realistic for the scope of the challenge.

---

## 2. Stack

### Backend
- Node.js
- Express
- TypeScript
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
- Zod
- SweetAlert2

---

## 3. System Structure

The solution is split into:

- **Backend API**
- **Frontend Web App**
- **PostgreSQL Database**

The backend is responsible for business rules, authorization, validation, and persistence.
The frontend is responsible for user interaction, route protection, forms, feedback, and role-aware UI.

---

## 4. Backend Architecture

The backend follows a **feature-based modular structure**.

```text
src/
  config/
  modules/
    auth/
    users/
    projects/
    tasks/
  routes/
  shared/
    errors/
    middleware/
    types/
    utils/
  app.ts
  server.ts
```

Each module contains its own:

- controller
- service
- repository
- schema
- routes

### Layer responsibilities

- **Controller**: handles HTTP request/response
- **Service**: contains business rules and permission checks
- **Repository**: executes SQL queries
- **Schema**: validates request data with Zod

This keeps the code easier to scale and avoids mixing concerns.

---

## 5. Frontend Architecture

The frontend also follows a **feature-based modular structure**.

```text
src/
  app/
  modules/
    auth/
    users/
    projects/
    tasks/
  shared/
  pages/
  styles/
```

Each module contains its own pages, components, API functions, schemas, and types.
Shared logic such as layout, hooks, constants, API client, and reusable UI components is kept in `shared`.

This structure makes the frontend easier to maintain and keeps features isolated.

---

## 6. Data Model

The main entities are:

- **users**
- **projects**
- **tasks**

### users
Stores application users and roles.

Important fields:
- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `avatar_url`
- `deleted_at`

### projects
Stores projects.

Important fields:
- `id`
- `name`
- `description`
- `status`
- `owner_id`

### tasks
Stores work items.

Important fields:
- `id`
- `title`
- `description`
- `status`
- `priority`
- `project_id`
- `assigned_to`
- `created_by`
- `due_date`

### Relationship decisions

- `projects.owner_id` defines the owner of the project
- `tasks.project_id` links tasks to projects
- `tasks.assigned_to` links tasks to users

---

## 7. Role Model

The system uses three global roles:

- `admin`
- `project_manager`
- `developer`

### Admin
- full access to users
- full access to projects
- full access to tasks
- global dashboard

### Project Manager
- creates and manages **own projects**
- manages tasks inside **own projects**
- can assign tasks to developers
- sees dashboard data related to own projects

### Developer
- sees assigned tasks
- updates own task status
- sees projects related to assigned tasks
- sees personal dashboard data

---

## 8. Project and Task Ownership Rules

### Project Manager and projects
A project manager is linked to a project through:

- `projects.owner_id`

This means:
- projects created by a project manager become their own projects
- “own projects” = projects where `owner_id = currentUser.id`

### Developer and projects
Developers do not own projects.
They access projects indirectly through assigned tasks.

This is resolved by filtering projects through tasks where:
- `tasks.assigned_to = currentUser.id`

### Task assignment rule
Tasks are assignable only to users with role:
- `developer`

This keeps the workflow consistent:
- admin manages globally
- project manager organizes work
- developer executes work

---

## 9. Authentication and Authorization

### Authentication
Authentication is based on JWT.

Flow:
1. user logs in
2. credentials are validated
3. token is generated
4. frontend sends token in `Authorization: Bearer <token>`

### Authorization
Authorization is enforced in two layers:

- **middleware**
- **service logic**

Middleware handles route-level protection.
Service logic handles contextual rules such as:
- project manager only accessing own projects
- developer only accessing own tasks

This makes the API safer than relying only on frontend restrictions.

---

## 10. Validation and Error Handling

### Validation
Validation is implemented with **Zod** on both backend and frontend.

Used for:
- request body and params in backend
- forms in frontend

### Error handling
The backend uses:
- `AppError`
- global error handler
- `asyncHandler`

This provides:
- cleaner controllers
- centralized error responses
- consistent API behavior

---

## 11. Soft Delete Strategy

Soft delete is implemented for:

- `users`

using:
- `deleted_at`

Reason:
- user records may need to remain referenced historically even after deactivation

Current behavior:
- users → soft delete
- projects → archive or hard delete
- tasks → hard delete

---

## 12. Frontend Protection and UX

The frontend uses:

- `ProtectedRoute`
- role-based route protection
- role-aware sidebar navigation

This means:
- unauthorized routes are blocked in UI
- links are hidden when the user should not see them
- backend remains the final source of permission control

The UI also uses:
- modal-based forms
- SweetAlert confirmations
- table-based CRUD views
- dashboard cards and summaries

---

## 13. Dashboard Design

The dashboard follows the requirement of being role-aware.

### Admin
Shows global information:
- users
- projects
- tasks
- task status summary
- upcoming tasks
- recent activity

### Project Manager
Shows information for own scope:
- own projects
- tasks in own projects
- task status summary
- upcoming tasks
- recent activity

### Developer
Shows personal scope:
- assigned tasks
- task status summary
- upcoming tasks
- recent activity

The dashboard relies on existing endpoints, which are already filtered by backend role rules.

---

## 14. Key Decisions

Main architectural decisions taken:

- use feature-based modular structure in backend and frontend
- use `owner_id` to model project manager ownership
- use assigned tasks to determine developer-related projects
- restrict task assignment to developers
- use backend as source of truth for permissions
- keep users as soft delete and avoid overcomplicating the model with extra membership tables

These choices were made to keep the solution aligned with the challenge while still showing clear architecture and maintainability.

---

## 15. Future Improvements

Possible next steps:

- pagination for list endpoints
- advanced filtering and sorting
- project detail page with related tasks
- Swagger documentation
- automated tests
- audit logs
- comments module
- project membership model if the domain grows

---

## 16. Conclusion

The final solution uses a modular, role-aware architecture that separates concerns clearly between backend and frontend.

The backend centralizes:
- business rules
- permissions
- validation
- persistence

The frontend provides:
- protected navigation
- clear CRUD flows
- role-based dashboards
- better interaction through forms, modals, and confirmations

This architecture is intentionally pragmatic: strong enough to demonstrate good engineering decisions, while remaining appropriate for the scope of the technical assessment.

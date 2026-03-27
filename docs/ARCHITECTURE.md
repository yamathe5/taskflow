# ARCHITECTURE.md

# TaskFlow Pro — Technical Decisions

## 1. Why this stack

I chose **Node.js + Express + TypeScript + PostgreSQL** for the backend because it provides a fast setup for REST APIs, strong ecosystem support, and good maintainability. PostgreSQL fits the relational nature of the domain because the system depends on clear entity relationships between users, projects, and tasks.

For the frontend, I chose **React + TypeScript + Vite** because it allows quick development, clean component composition, and a lightweight setup for a technical assessment. Axios, React Hook Form, and Zod simplify API communication, form handling, and validation.

These technologies complement each other well for a role-based CRUD application with authentication and dashboard features.

## 2. General architecture

The project is split into two applications:

- **backend**: REST API, business rules, validation, authorization, persistence
- **frontend**: protected UI, forms, dashboards, modals, feedback, route handling

The backend is the source of truth for:
- authentication
- authorization
- role restrictions
- validation
- business rules

The frontend is responsible for:
- user experience
- protected routes
- role-aware navigation
- data entry and interaction flows

## 3. Folder structure decision

The challenge provided a suggested folder structure as a reference. I adapted it into a **feature-based modular structure** because it keeps each domain isolated while preserving layered responsibilities.

### Backend
Each module contains:
- controller
- service
- repository
- schema
- routes

Modules:
- auth
- users
- projects
- tasks

Shared concerns are extracted into:
- middleware
- errors
- utils
- config

### Frontend
The frontend is also organized by feature:
- auth
- users
- projects
- tasks

Reusable logic is placed in shared folders for:
- API client
- layout
- constants
- components
- hooks
- styles

This structure is easier to scale than grouping everything globally by technical type only.

## 4. Patterns used

### Service Layer
Business logic is kept in services instead of controllers. This keeps controllers thin and makes rules easier to test and maintain.

### Repository Pattern
Database access is isolated in repositories. This separates SQL queries from business logic and makes the service layer cleaner.

### Controller Layer
Controllers handle HTTP requests and responses only.

### Validation Layer
Zod schemas validate request payloads and form inputs.

This combination is close to a pragmatic **controller/service/repository** architecture.

## 5. Authentication and authorization strategy

Authentication uses **JWT**.

Flow:
1. User logs in with email and password
2. Password is validated with bcrypt
3. A JWT token is generated
4. The frontend stores the token and sends it in the `Authorization` header

Authorization is enforced in two places:
- route/middleware level for coarse access control
- service level for contextual permission checks

This is important because some rules depend on ownership, not only on role.

Examples:
- Admin can access all users, projects, and tasks
- Project Manager can manage only own projects and tasks in own projects
- Developer can only access own assigned tasks

## 6. Database structure and relationships

### users
Stores platform users and roles.

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
Stores tasks.

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

### Relationships
- `projects.owner_id -> users.id`
- `tasks.project_id -> projects.id`
- `tasks.assigned_to -> users.id`
- `tasks.created_by -> users.id`

The migration also adds indexes for frequent lookups such as:
- email
- project_id
- assigned_to

## 7. Role model and domain decisions

### Admin
- full access
- global dashboard
- can manage users, projects, and tasks

### Project Manager
- can create and manage own projects
- can manage tasks within own projects
- can assign tasks to developers

### Developer
- can see own assigned tasks
- can update own tasks
- sees projects through tasks assigned to them

### Important decision
I used `projects.owner_id` to model Project Manager ownership instead of adding a separate project membership table. This keeps the solution aligned with the test scope and simplifies permission checks.

I also restricted task assignment to **developer** users to keep the workflow consistent:
- admin manages globally
- project manager organizes work
- developer executes work

## 8. Error handling and API format

The backend uses:
- a custom `AppError`
- centralized error handling middleware
- standardized response helpers

Successful responses follow a consistent shape with:
- `success`
- `message`
- `data`

Validation and business errors are normalized through the global error handler.
This keeps API responses predictable and aligns with the challenge requirement for consistent response formatting.

## 9. Dashboard approach

The dashboard is role-aware:

- **Admin** sees global information
- **Project Manager** sees own projects and related tasks
- **Developer** sees own tasks

The dashboard includes:
- task count by status
- upcoming tasks
- recent activity

This is implemented by reusing existing endpoints that already return role-filtered data.

## 10. Trade-offs and future improvements

Because of time constraints, I prioritized:
- authentication
- role permissions
- CRUD flows
- dashboard
- migrations and seeders
- consistent API responses

With more time, I would improve:
- full pagination and sorting metadata on every list endpoint
- Swagger/OpenAPI or Postman collection fully linked in the repo
- project detail page with associated tasks
- tests
- more advanced filtering
- activity/audit logs
- Docker setup

## 11. Summary

This solution uses a modular full-stack architecture that separates concerns clearly and keeps the system maintainable. The backend centralizes permissions and business logic, while the frontend focuses on usability and protected interaction flows. The architecture was designed to satisfy the challenge requirements while remaining realistic for the available time.

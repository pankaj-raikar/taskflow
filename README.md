# TaskFlow

![Bun](https://img.shields.io/badge/runtime-Bun-000000?logo=bun&logoColor=white)
![Hono](https://img.shields.io/badge/api-Hono-E36002?logo=hono&logoColor=white)
![Drizzle](https://img.shields.io/badge/orm-Drizzle_C3F53C-111827)
![Supabase](https://img.shields.io/badge/database-Supabase_Postgres-3ECF8E?logo=supabase&logoColor=111827)
![React](https://img.shields.io/badge/frontend-React_19-61DAFB?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript&logoColor=white)

TaskFlow is a Vite React task dashboard with a Bun-native Hono API backend.
The backend uses Drizzle ORM with Supabase Postgres, Zod request validation,
JWT auth, and `Bun.password` for password hashing.

## Contents

- [Architecture](#architecture)
- [Frontend Audit](#frontend-audit)
- [Technical Decisions](#technical-decisions)
- [Assumptions](#assumptions)
- [Tradeoffs](#tradeoffs)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Verification](#verification)
- [Deployment Notes](#deployment-notes)

## Architecture

```mermaid
flowchart LR
  Browser["React + Vite UI"] -->|fetch + bearer token| API["Hono API /api"]
  API --> Auth["JWT middleware"]
  Auth --> Routes["Auth, Users, Tasks, Projects, Notifications"]
  Routes --> Validators["Zod + @hono/zod-validator"]
  Validators --> ORM["Drizzle ORM"]
  ORM --> Supabase[("Supabase Postgres")]

  API --> CORS["CORS: FRONTEND_URL"]
  API --> Logger["hono/logger"]
```

Backend source layout:

```text
backend/src/
  index.ts
  app.ts
  db/
    index.ts
    migrate.ts
    schema.ts
  middleware/
    auth.ts
    error.ts
  routes/
    auth.ts
    index.ts
    notifications.ts
    projects.ts
    tasks.ts
    users.ts
  validators/
    auth.ts
    notifications.ts
    projects.ts
    tasks.ts
    users.ts
```

## Frontend Audit

The frontend is wired to the backend through `frontend/src/api.ts`.
Auth calls use `/api/auth/register` and `/api/auth/login`; protected task calls
send `Authorization: Bearer <token>` and persist the session in `localStorage`
under `taskflow_auth_session`.

Tasks are loaded from `/api/tasks` after login and all task create, update,
move, star, and delete actions call the Hono backend. Projects and
notifications still use mock display data because the current UI does not edit
those resources yet.

UI-rendered models:

| Model | Fields |
| --- | --- |
| User | `id`, `name`, `email`, `avatar`, `bio`, `role`, `status` |
| Task | `id`, `title`, `description`, `status`, `category`, `priority`, `dueDate`, `dateLabel`, `assigneeId`, `starred` |
| Notification | `id`, `title`, `content`, `time`, `read` |
| Project | `id`, `name`, `progress`, `color`, `tasksCount` |

## Technical Decisions

| Area | Decision | Reason |
| --- | --- | --- |
| Runtime | Bun | Matches the requested stack and gives native `Bun.password`. |
| HTTP framework | Hono | Small Bun-friendly API surface with built-in middleware support. |
| Authentication | JWT signed with `JWT_SECRET`, 7-day expiry | Stateless auth, easy to consume from a future SPA integration. |
| Password storage | `Bun.password.hash` / `Bun.password.verify` | Uses Bun's built-in bcrypt support without extra dependencies. |
| Database | Supabase Postgres via `postgres` | Durable hosted persistence compatible with Vercel serverless deployments. |
| ORM | Drizzle | Type-safe schema and SQL access without hiding relational details. |
| Validation | Zod schemas per resource | Every `POST` and `PATCH` body is validated before route logic runs. |
| Response shape | `{ data }` and `{ error }` | Simple contract aligned with the original backend requirements. |

## Assumptions

- The frontend now integrates auth and task CRUD with the backend, while
  read-only project and notification panels remain mock-driven.
- `dateLabel` is persisted on tasks because the UI expects it as a rendered
  field, even though it can be derived from `status` and `dueDate`.
- `GET /api/users` is scoped to the signed-in user to satisfy the backend rule
  that all authenticated queries are filtered by `userId`.
- `DATABASE_URL` should use Supabase's pooled Postgres connection string.
- Frontend quick-login/social buttons remain UI-only until the React app is
  wired to `/api/auth/register` and `/api/auth/login`.

## Tradeoffs

| Tradeoff | Benefit | Cost |
| --- | --- | --- |
| Supabase Postgres | Durable storage, pooling, backups, and Vercel-friendly serverless access. | Requires a hosted database connection string for local integration tests and deployment. |
| JWT stateless sessions | No session table or cache required. | Token revocation needs an additional denylist/session model later. |
| Persisted `dateLabel` | Frontend can render directly with no extra mapping layer. | Backend must keep label logic consistent during task updates. |
| Narrow user listing | Stronger tenant isolation by default. | A future team directory may need a separate membership-aware endpoint. |
| Incremental frontend integration | Auth and task workflows are connected without reshaping the whole UI. | Read-only project and notification panels still need API-backed loading later. |

## Setup

### Frontend

```bash
cd frontend
bun install
bun run dev
```

The frontend runs at `http://localhost:5173` and expects the backend API at
`/_/backend/api` by default for Vercel Services. For separate local frontend and
backend dev servers, set `VITE_API_URL=http://localhost:3000/api`.

### Backend

```bash
cd backend
bun install
cp .env.example .env
bun run db:migrate
bun run dev
```

Set `DATABASE_URL` in `.env` before running migrations. In Supabase, use
Database Settings -> Connection String -> Transaction pooler or Session pooler,
then replace the password placeholder.

## Environment Variables

Backend (`backend/.env.example`):

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend HTTP port. Defaults to `3000`. |
| `JWT_SECRET` | Yes | Secret used to sign and verify 7-day JWTs. Startup fails when missing. |
| `DATABASE_URL` | Yes | Supabase Postgres pooled connection string. |
| `FRONTEND_URL` | No | Allowed CORS origin. Defaults to `http://localhost:5173`. |

Frontend (`frontend/.env.example`):

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Existing template | Gemini key from the original frontend template. Not used by the backend. |
| `APP_URL` | Existing template | App hosting URL from the original frontend template. |
| `VITE_API_URL` | No | Backend API base URL. Defaults to `/_/backend/api`. |

## API Endpoints

All routes are mounted under `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Method | Path | Auth | Body | Success |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | No | `{ name, email, password }` | `201 { token, user }` |
| `POST` | `/api/auth/login` | No | `{ email, password }` | `200 { token, user }` |
| `GET` | `/api/users/me` | Yes | None | `200 { data: user }` |
| `PATCH` | `/api/users/me` | Yes | partial `{ name, avatar, bio, role, status }` | `200 { data: user }` |
| `GET` | `/api/users` | Yes | None | `200 { data: user[] }` |
| `GET` | `/api/users/:id` | Yes | None | `200 { data: user }` |
| `GET` | `/api/tasks` | Yes | None | `200 { data: task[] }` |
| `GET` | `/api/tasks/:id` | Yes | None | `200 { data: task }` |
| `POST` | `/api/tasks` | Yes | `{ title, description, status, category, priority, dueDate, assigneeId, starred }` | `201 { data: task }` |
| `PATCH` | `/api/tasks/:id` | Yes | partial task body | `200 { data: task }` |
| `DELETE` | `/api/tasks/:id` | Yes | None | `200 { data: task }` |
| `GET` | `/api/projects` | Yes | None | `200 { data: project[] }` |
| `GET` | `/api/projects/:id` | Yes | None | `200 { data: project }` |
| `POST` | `/api/projects` | Yes | `{ name, progress, color, tasksCount }` | `201 { data: project }` |
| `PATCH` | `/api/projects/:id` | Yes | partial project body | `200 { data: project }` |
| `DELETE` | `/api/projects/:id` | Yes | None | `200 { data: project }` |
| `GET` | `/api/notifications` | Yes | None | `200 { data: notification[] }` |
| `POST` | `/api/notifications` | Yes | `{ title, content, time, read }` | `201 { data: notification }` |
| `PATCH` | `/api/notifications/:id` | Yes | partial notification body | `200 { data: notification }` |
| `DELETE` | `/api/notifications/:id` | Yes | None | `200 { data: notification }` |
| `GET` | `/health` | No | None | `200 { data: { status: "ok" } }` |

Common errors return `{ error }` with appropriate status codes: `400` for
validation, `401` for missing/invalid auth, `404` for missing records, and
`409` for duplicate registration.

## Verification

```bash
cd backend
TEST_DATABASE_URL=<supabase-or-test-postgres-url> bun test
bun run typecheck
bun run db:generate
bun run db:migrate

cd ../frontend
bun run test
bun run lint
bun run build
```

## Deployment Notes

Deploy the frontend to Vercel as a static Vite app. Set any frontend
environment variables in Vercel project settings.

Deploy frontend and backend with Vercel Services. Set `JWT_SECRET` and
`DATABASE_URL` in Vercel environment variables. Apply the Drizzle migration to
Supabase before using the deployed API:

```bash
cd backend
DATABASE_URL=<supabase-pooled-connection-string> bun run db:migrate
```

Backend API routes are available under `/_/backend/api/*` in the Vercel
deployment.

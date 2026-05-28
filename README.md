# TaskFlow

TaskFlow is a Vite React frontend with a Bun-native Hono API backend. The backend uses Drizzle ORM with SQLite, Zod request validation, JWT auth, and Bun password hashing.

## Frontend Audit

The current `frontend/src/` code has no network API calls. It uses local component state, `MOCK_USERS`, `MOCK_PROJECTS`, `MOCK_NOTIFICATIONS`, and `INITIAL_TASKS` from `frontend/src/data.ts`, with task persistence stored in `localStorage` under `taskflow_tasks_list`.

There is no frontend auth token flow yet: no token is stored, and no `Authorization` header is sent. `frontend/.env.example` currently defines Gemini/App URL variables and no backend URL variable.

UI-rendered models:

| Model | Fields |
| --- | --- |
| User | `id`, `name`, `email`, `avatar`, `bio`, `role`, `status` |
| Task | `id`, `title`, `description`, `status`, `category`, `priority`, `dueDate`, `dateLabel`, `assigneeId`, `starred` |
| Notification | `id`, `title`, `content`, `time`, `read` |
| Project | `id`, `name`, `progress`, `color`, `tasksCount` |

## Setup

Frontend:

```bash
cd frontend
bun install
bun run dev
```

Backend:

```bash
cd backend
bun install
cp .env.example .env
bun run db:generate
bun run db:migrate
bun run dev
```

Backend verification:

```bash
cd backend
bun test
bun run typecheck
```

## Environment Variables

Backend (`backend/.env.example`):

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend HTTP port. Defaults to `3000`. |
| `JWT_SECRET` | Yes | Secret used to sign and verify 7-day JWTs. Startup fails when missing. |
| `DATABASE_URL` | No | SQLite database path. Defaults to `./dev.db`. |
| `FRONTEND_URL` | No | Allowed CORS origin. Defaults to `http://localhost:5173`. |

Frontend (`frontend/.env.example`):

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Existing template | Gemini key from the original frontend template. Not used by the backend. |
| `APP_URL` | Existing template | App hosting URL from the original frontend template. |

## API Endpoints

All routes are mounted under `/api`. Protected routes require `Authorization: Bearer <token>`.

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

Common errors return `{ error }` with appropriate status codes: `400` for validation, `401` for missing/invalid auth, `404` for missing records, and `409` for duplicate registration.

## Deployment Notes

Deploy the frontend to Vercel as a static Vite app. Set any frontend environment variables in Vercel project settings.

Deploy the backend to Railway with Bun. Set `JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL`, and optional `PORT` in Railway variables. Use `bun run db:migrate` during release/startup before `bun run start`, and persist the SQLite database path with Railway storage if using SQLite in production.

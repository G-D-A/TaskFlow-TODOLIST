# TaskFlow TODOLIST

A full-stack TODO application with user authentication and personal task management.

## Features

- User registration and login with JWT authentication
- Secure password hashing with bcrypt
- Personal tasks: each user can access only their own tasks
- Create, view, edit, and delete tasks
- Task statuses: `todo`, `in progress`, and `done`
- Filter tasks by status
- Persistent PostgreSQL storage
- Responsive React interface with loading, error, and empty states

## Tech stack

- **Frontend:** React, Vite, TanStack Query, Axios
- **Backend:** Node.js, Express, Sequelize
- **Database:** PostgreSQL 16 (Docker)
- **Authentication:** JWT and bcrypt

## Project structure

```text
client/                 React application
  src/api/              API request functions
  src/App.jsx           Authentication flow
  src/TaskDashboard.jsx Task management UI
server/                 Express API
  src/models/           Sequelize User and Task models
  src/routes/           Authentication and task endpoints
  src/middleware/       JWT middleware
compose.yaml            PostgreSQL Docker configuration
```

## Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the backend environment file:

   ```bash
   cp server/.env.example server/.env
   ```

   The default values in `server/.env.example` match the local Docker PostgreSQL configuration.

3. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

4. Start the backend in one terminal:

   ```bash
   npm start
   ```

   The API starts at `http://localhost:5001` and creates the database tables automatically.

5. Start the frontend in a second terminal:

   ```bash
   npm run dev:client
   ```

6. Open `http://localhost:5173` in a browser.

Alternatively, run both the backend and frontend together:

```bash
npm run dev
```

## Environment variables

`server/.env`:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://todo_user:todo_password@localhost:5432/todo_app
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

For a production deployment, use a strong unique `JWT_SECRET` and different database credentials.

## API endpoints

| Method | Endpoint | Description | Auth required |
| --- | --- | --- | --- |
| `GET` | `/api/health` | API health check | No |
| `POST` | `/api/auth/register` | Register a user | No |
| `POST` | `/api/auth/login` | Log in and receive a JWT | No |
| `GET` | `/api/tasks?status=todo` | Get current user's tasks, optionally filtered | Yes |
| `POST` | `/api/tasks` | Create a task | Yes |
| `PATCH` | `/api/tasks/:id` | Update a task | Yes |
| `DELETE` | `/api/tasks/:id` | Delete a task | Yes |

Protected endpoints require the header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Available scripts

```bash
npm start           # Run the Express API
npm run dev:client  # Run the React development server
npm run dev         # Run backend and frontend together with auto-reload
npm run build       # Create a production frontend build
```

## Stopping PostgreSQL

```bash
docker compose down
```

This stops the container while preserving database data. Do not run `docker compose down -v` unless you intentionally want to remove the local database volume and all its data.

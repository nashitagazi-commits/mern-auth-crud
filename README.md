# Vault — Authentication System with CRUD and JWT

A full-stack MERN application implementing secure user authentication and
authorization with JWT, plus a complete CRUD module (task management) built
on top of it.

## Tech stack

| Category       | Details                                   |
|----------------|--------------------------------------------|
| Frontend       | React 18 + Vite, React Router, Tailwind CSS, Axios |
| Backend        | Node.js + Express                          |
| Database       | MongoDB with Mongoose                       |
| Authentication | JWT (short-lived access token + rotating refresh token) |

## Features

**Core (from the brief)**
- User signup / login
- Protected routes (backend middleware + frontend route guards)
- Full CRUD (create, read, update, delete) on a `Task` resource, scoped per user
- Token validation on every protected request
- Password hashing with bcrypt

**Added on top, to go beyond the base spec**
- **Access + refresh token pattern**: 15-minute access token kept in memory
  (never localStorage, to reduce XSS exposure) + a 7-day refresh token in an
  httpOnly cookie, with automatic silent refresh via an Axios interceptor —
  the user is never logged out just because a short-lived token expired.
- **Refresh token rotation & revocation**: each refresh issues a new token
  and invalidates the old one; logout and password reset revoke sessions.
- **Password reset flow**: forgot-password / reset-password with a
  time-limited, hashed reset token (15 min expiry). No email service is
  wired up, so in dev mode the token is returned directly in the API
  response and the frontend surfaces a clickable reset link — swap in
  Nodemailer/SendGrid for production and remove that dev branch.
- **Rate limiting** on auth endpoints (brute-force protection) and a global
  API rate limit.
- **Input validation** (express-validator) and centralized error handling.
- **Role field on users** (`user` / `admin`) with an `authorize()` middleware
  ready to gate admin-only routes, for easy extension.
- **Search, filter, sort & pagination** on the task list (`?search=&status=&priority=&sort=&page=&limit=`).
- **Task stats endpoint** for a quick dashboard summary.
- **Security headers** via Helmet, scoped CORS with credentials, request
  body size limits.
- A distinctive, non-templated UI themed around the security/session
  concept — including a live "session ledger" that visibly counts down the
  access token's remaining lifetime and shows it rotating in real time.

## Screenshots

All screenshots are in the `screenshots/` folder at the project root.

| | |
|---|---|
| **Register** — `screenshots/register.png` | New account form with live password requirement checks |
| **Login** — `screenshots/login.png` | Sign-in page |
| **Forgot password** — `screenshots/reset-password-link.png` | Dev-mode reset link (no email service configured, see note below) |
| **Reset password** — `screenshots/reset-password.png` | Setting a new password from the reset link |
| **Dashboard** — `screenshots/dashboard.png` | Task list with the live access-token countdown ring and task summary |
| **Add task** — `screenshots/add-new-task.png` | Create-task modal |
| **Edit task** — `screenshots/edit-task.png` | Edit-task modal, pre-filled |
| **Delete task** — `screenshots/delete-task.png` | Delete confirmation |
| **Search & filter** — `screenshots/search-filter.png` | Live partial-text search across tasks |
| **Status filter** — `screenshots/status-filter.png` | Filter dropdown, including the computed "Overdue" status |
| **Backend + CRUD live** — `screenshots/backend-crud-operations-live.png` | Code + terminal side by side, showing real GET/POST/DELETE requests hitting the API |

## Project structure

```
mern-auth-crud/
├── backend/
│   ├── config/db.js
│   ├── middleware/ (auth.js, errorHandler.js)
│   ├── models/ (User.js, Task.js)
│   ├── routes/ (auth.js, tasks.js)
│   ├── utils/generateTokens.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/ (Navbar, ProtectedRoute, TaskModal, SessionLedger)
    │   ├── pages/ (Login, Register, ForgotPassword, ResetPassword, Dashboard)
    │   ├── App.jsx, main.jsx, index.css
    └── .env.example
```

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate strong random values, e.g. `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

```bash
npm run dev
```
Server runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
App runs on `http://localhost:5173`.

### 3. Try it out
1. Go to `http://localhost:5173`, register a new account.
2. You'll land on the dashboard — create, edit, delete, filter and search tasks.
3. Watch the "access token" panel count down in real time; it silently
   refreshes without you noticing.
4. Log out, then try "forgot password" to see the reset flow end-to-end.

## API reference

| Method | Endpoint                          | Auth required | Description |
|--------|------------------------------------|---------------|--------------|
| POST   | `/api/auth/register`               | No            | Create account |
| POST   | `/api/auth/login`                  | No            | Log in |
| POST   | `/api/auth/refresh`                | Cookie        | Rotate access token |
| POST   | `/api/auth/logout`                 | Cookie        | Revoke refresh token |
| GET    | `/api/auth/me`                     | Yes           | Current user profile |
| POST   | `/api/auth/forgot-password`        | No            | Request reset token |
| POST   | `/api/auth/reset-password/:token`  | No            | Set new password |
| GET    | `/api/tasks`                       | Yes           | List tasks (search/filter/paginate) |
| GET    | `/api/tasks/stats`                 | Yes           | Task counts by status |
| GET    | `/api/tasks/:id`                   | Yes           | Get one task |
| POST   | `/api/tasks`                       | Yes           | Create task |
| PUT    | `/api/tasks/:id`                   | Yes           | Update task |
| DELETE | `/api/tasks/:id`                   | Yes           | Delete task |
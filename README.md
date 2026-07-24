# Authentication System with CRUD and JWT

A full stack MERN app with user authentication and a task manager built on top of it. Users can sign up, log in, and do CRUD operations (create, read, update, delete) on their own tasks. All the task routes are protected using JWT.

## Tech Stack

- Frontend: React.js + Axios
- Backend: Node.js + Express.js
- Database: MongoDB with Mongoose
- Auth: JWT (access token + refresh token)

## Features

- User signup and login
- Protected routes (you need a valid token to access tasks)
- Full CRUD on tasks (create, edit, delete, mark status)
- Password hashing using bcrypt
- Forgot password / reset password flow
- Access token expires in 15 min, refresh token keeps the session going so the user doesn't have to log in again and again
- Rate limiting on login/signup so it can't be spammed
- Search, filter by status, and pagination on the task list
- Tasks show as "overdue" or "due soon" based on the due date
- Task summary showing how many todo / in-progress / done / overdue

## Screenshots

Screenshots are in the `screenshots` folder:

- `register.png` – signup page
- `login.png` – login page
- `reset-password-link.png` / `reset-password.png` – forgot password flow
- `dashboard.png` – main dashboard with tasks
- `add-new-task.png` / `edit-task.png` / `delete-task.png` – CRUD in action
- `search-filter.png` / `status-filter.png` – search and filter working
- `backend-crud-operations-live.png` – backend terminal showing the API requests going through

## Folder Structure

```
mern-auth-crud/
├── backend/
│   ├── config/db.js
│   ├── middleware/
│   ├── models/ (User.js, Task.js)
│   ├── routes/ (auth.js, tasks.js)
│   ├── utils/
│   └── server.js
└── frontend/
    └── src/
        ├── api/
        ├── context/
        ├── components/
        └── pages/
```

## How to Run

### Backend

```
cd backend
npm install
```

Create a `.env` file (use `.env.example` as reference) and add:
- `MONGO_URI` – your MongoDB connection string
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` – any long random string

```
npm run dev
```

Runs on `http://localhost:5000`

### Frontend

```
cd frontend
npm install
```

Create a `.env` file (use `.env.example` as reference).

```
npm run dev
```

Runs on `http://localhost:5173`

### Using it

1. Open `http://localhost:5173` and register a new account
2. You'll be taken to the dashboard where you can add/edit/delete tasks
3. Try the search bar and status filter
4. Try forgot password – since there's no email service set up, the reset link is shown directly on the page instead of being emailed (this was outside the scope of the project)

## API Endpoints

| Method | Endpoint | Auth needed | What it does |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/refresh | Cookie | Get new access token |
| POST | /api/auth/logout | Cookie | Logout |
| GET | /api/auth/me | Yes | Get logged in user |
| POST | /api/auth/forgot-password | No | Request password reset |
| POST | /api/auth/reset-password/:token | No | Reset password |
| GET | /api/tasks | Yes | Get all tasks (supports search/filter/page) |
| GET | /api/tasks/stats | Yes | Get task counts |
| GET | /api/tasks/:id | Yes | Get single task |
| POST | /api/tasks | Yes | Create task |
| PUT | /api/tasks/:id | Yes | Update task |
| DELETE | /api/tasks/:id | Yes | Delete task |
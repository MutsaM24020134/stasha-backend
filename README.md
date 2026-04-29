# Stasha – Backend API

**Name:** Mutsawashe Maraidza  
**Student ID:** 24020134  
**Module:** INFS 202  
**Project:** Backend Individual Project  

---

## Overview

This is the backend for Stasha, my INFS 202 midterm project. It is a RESTful API built with Node.js and Express that handles user authentication and task management. I used SQLite as the database because it is lightweight, easy to set up, and fully SQL based which meets the project requirements.

The API is consumed by the Stasha frontend which is deployed separately on Vercel.

---

## Live Links

- **API:** https://stasha-backend.onrender.com
- **Frontend:** https://stasha-frontend.vercel.app

---

## Tech Stack

- Node.js
- Express.js
- better-sqlite3 (SQLite database)
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv
- CORS

---

## Project Structure

```
stasha-backend/
├── src/
│   ├── routes/
│   │   ├── auth.js       — login, register, forgot/reset password
│   │   └── tasks.js      — all task CRUD operations
│   ├── middleware/
│   │   └── auth.js       — JWT token verification
│   └── database.js       — database setup and table creation
├── server.js             — main entry point
├── .env                  — environment variables
├── README.md             — project documentation
└── package.json
```
---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and get a JWT token |
| POST | /api/auth/forgot-password | Get security question for email |
| POST | /api/auth/reset-password | Reset password using security answer |

### Tasks
All task routes require a valid JWT token in the Authorization header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks for the logged in user |
| GET | /api/tasks/:id | Get a single task by ID |
| POST | /api/tasks | Create a new task |
| PUT | /api/tasks/:id | Update an existing task |
| DELETE | /api/tasks/:id | Delete a task |

---

## Database Design

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto increment |
| name | TEXT | Full name |
| email | TEXT | Unique |
| password | TEXT | Hashed with bcryptjs |
| security_question | TEXT | Used for password reset |
| security_answer | TEXT | Hashed with bcryptjs |
| created_at | DATETIME | Auto set on creation |

### tasks
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto increment |
| user_id | INTEGER | Foreign key to users table |
| title | TEXT | Required |
| description | TEXT | Optional |
| priority | TEXT | High, Mid or Low |
| category | TEXT | e.g. Work, Health, School |
| due_date | TEXT | Date string |
| completed | INTEGER | 0 = pending, 1 = done |
| created_at | DATETIME | Auto set on creation |

---

## Security

- Passwords are hashed using bcryptjs before being stored
- Security answers are also hashed
- JWT tokens expire after 7 days
- All task routes are protected with a JWT middleware
- Sensitive values like JWT secret are stored in environment variables

---

## How to Run Locally

```bash
# Clone the repo
git clone https://github.com/MutsaM24020134/stasha-backend.git
cd stasha-backend

# Install dependencies
npm install

# Create a .env file
PORT=5000
JWT_SECRET=stasha_secret_key_2026

# Start the server
node server.js
```

Server runs on http://localhost:5000

---

## Testing the API

### Register a new user
```bash
$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method POST -ContentType "application/json" -Body '{"name":"Mutsawashe Maraidza","email":"mutsa@student.ac.bw","password":"password123","securityQuestion":"What city were you born in?","securityAnswer":"gaborone"}'
```

### Login
```bash
$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"mutsa@student.ac.bw","password":"password123"}'
$token = $response.token
```

### Create a task
```bash
Invoke-RestMethod -Uri http://localhost:5000/api/tasks -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"title":"Study for INFS exam","priority":"High","category":"School","due_date":"2026-05-05"}'
```

### Get all tasks
```bash
Invoke-RestMethod -Uri http://localhost:5000/api/tasks -Method GET -Headers @{Authorization="Bearer $token"}
```

### Delete a task
```bash
Invoke-RestMethod -Uri http://localhost:5000/api/tasks/1 -Method DELETE -Headers @{Authorization="Bearer $token"}
```

---

## Deployment

The backend is deployed on Render.com as a free web service. It connects to a SQLite database stored on the server. The frontend on Vercel communicates with this API using Axios.

- **Platform:** Render.com
- **Database:** SQLite (better-sqlite3)
- **Live URL:** https://stasha-backend.onrender.com


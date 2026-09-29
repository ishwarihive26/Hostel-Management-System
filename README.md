# HostelHub — Hostel Room Management System

A simple, role-based hostel room management system built with **React, Node.js,
Express and MongoDB**. Admins/Wardens can add rooms, allocate students (max 2
per room), and resolve complaints. Students can view their room and raise
maintenance complaints.

---

## Tech Stack

| Layer     | Technology                                   |
|-----------|-----------------------------------------------|
| Frontend  | React 18 (Vite), React Router, Axios          |
| Backend   | Node.js, Express.js                           |
| Database  | MongoDB + Mongoose                            |
| Auth      | JWT (JSON Web Tokens) + bcrypt password hashing |

---

## Features

- Separate Register/Login flows for **Student** and **Admin/Warden**, with
  role-based dashboards and route protection.
- Admin can **add hostel rooms** (room number, block, capacity).
- Admin can **allocate students to rooms** — with server-side validation:
  - A room cannot hold more than **2 students**.
  - A student **cannot be allocated to more than one active room**.
- Students can view their **assigned room details** and roommates.
- Only a **student who is currently assigned to a room** can submit a
  complaint.
- Admin can **view all complaints** and **mark them as Resolved**.
- Clean, responsive UI modeled after the provided design reference.

---

## Project Structure

```
hostel-management-system/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Room, Complaint schemas
│   ├── middleware/auth.js        # JWT protect + role authorize
│   ├── controllers/              # Route logic (auth, rooms, complaints)
│   ├── routes/                   # Express routers
│   ├── seed.js                   # Seeds test accounts & sample rooms
│   ├── server.js                 # App entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/           # Sidebar, Topbar, ProtectedRoute, etc.
│   │   ├── pages/                # Home, Login, Register, Dashboards...
│   │   └── styles/index.css      # Design system / global styles
│   └── .env.example
├── setup.bat                     # Windows: installs all dependencies
├── run.bat                       # Windows: starts backend + frontend
└── README.md
```

---

## Prerequisites

1. **Node.js 18+** — https://nodejs.org
2. **MongoDB** running locally (or a MongoDB Atlas connection string)
   - Local install: https://www.mongodb.com/try/download/community
   - Or use a free cloud cluster: https://www.mongodb.com/cloud/atlas

> **About virtual environments:** Node.js projects don't use a Python-style
> "venv". Instead, every project keeps its own isolated dependencies inside
> its local `node_modules/` folder (created by `npm install`), so the
> `backend` and `frontend` dependencies never conflict with anything else on
> your machine or with each other. Nothing needs to be "activated" — you just
> `cd` into the folder and run the npm scripts. `setup.bat` does this for you
> automatically.

---

## Quick Start (Windows — one click)

1. Unzip the project.
2. Make sure MongoDB is installed and **running** (or update `MONGO_URI` in
   `backend/.env` to point to your Atlas cluster).
3. Double-click **`setup.bat`** — this installs backend + frontend
   dependencies and creates `.env` files from the examples.
4. (Optional but recommended) Load sample data:
   ```
   cd backend
   npm run seed
   ```
5. Double-click **`run.bat`** — this starts both servers and opens
   `http://localhost:5173` in your browser.

---

## Manual Setup (macOS / Linux / Windows)

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed               # optional: creates test accounts + sample rooms
npm run dev                 # starts on http://localhost:5000 (nodemon)
# or: npm start
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Test Credentials

Run `npm run seed` inside `backend/` to create these accounts automatically:

| Role    | Email                  | Password    | Notes                          |
|---------|-------------------------|-------------|---------------------------------|
| Admin   | admin@hostelhub.com     | admin123    | Full admin access               |
| Student | priya@hostelhub.com     | student123  | Pre-assigned to room **B-203**  |
| Student | rahul@hostelhub.com     | student123  | Pre-assigned to room **A-101**  |
| Student | ananya@hostelhub.com    | student123  | **Unassigned** — try allocating her as admin |

Sample rooms created: `A-101`, `A-102`, `B-201`, `B-203`, `C-301` (capacity 2
each). A sample "Pending" complaint is created for Priya so you can test the
admin resolve flow immediately.

You can also just register new Student/Admin accounts from the app itself —
seeding is only a shortcut for demo data.

---

## API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint                          | Access        | Description                          |
|--------|------------------------------------|---------------|----------------------------------------|
| POST   | `/auth/register`                   | Public        | Register as student or admin           |
| POST   | `/auth/login`                      | Public        | Login (role must match account role)   |
| GET    | `/auth/me`                         | Private       | Get current logged-in user             |
| POST   | `/rooms`                           | Admin         | Add a new room                         |
| GET    | `/rooms`                           | Admin         | List all rooms with occupants          |
| GET    | `/rooms/my-room`                   | Student       | Get own assigned room                  |
| GET    | `/rooms/unassigned-students`       | Admin         | List students not yet allocated        |
| POST   | `/rooms/:roomId/allocate`          | Admin         | Allocate a student to a room           |
| POST   | `/rooms/:roomId/unallocate`        | Admin         | Remove a student from a room           |
| POST   | `/complaints`                      | Student       | Submit a complaint (must have a room)  |
| GET    | `/complaints`                      | Private       | Admin: all complaints / Student: own   |
| GET    | `/complaints/:id`                  | Private       | Get single complaint details           |
| PATCH  | `/complaints/:id`                  | Admin         | Update complaint status                |

All private routes require an `Authorization: Bearer <token>` header, set
automatically by the frontend after login/register.

---

## Business Rules Enforced (server-side)

- Room `capacity` is capped at **2**.
- Allocation is rejected if the target room already has 2 students
  (`"This room is already full"`).
- Allocation is rejected if the student already has an `assignedRoom`
  (`"<name> is already assigned to another room"`).
- Complaint creation is rejected if the logged-in student has no
  `assignedRoom` (`"You must be allocated to a room before you can raise a
  complaint"`).
- Students can only see and act on their **own** complaints and room;
  admins can see everything.
- Login enforces the selected role tab matches the account's actual role.

---

## Notes

- This is intentionally a **basic** implementation as scoped: no room
  transfer/change requests, no complaint escalation or priority levels, no
  timers. Just registration, login, room allocation, and complaint
  submit/resolve.
- Passwords are hashed with bcrypt; JWTs expire after 7 days by default
  (`JWT_EXPIRES_IN` in `backend/.env`).

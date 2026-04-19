# HR & Equipment Management System

A full-stack, professional HR and Equipment Management dashboard. Built to demonstrate clean architecture, robust API design, and a modern frontend UI.

## Tech Stack

- **Backend:** Laravel 11.x, Sanctum (Token Auth), SQLite (can easily be swapped to PostgreSQL)
- **Frontend:** React 19, Vite, Tailwind CSS 4, Recharts, React Router v7
- **Icons:** Lucide React

## Features

- **Authentication:** Role-based access control (Admin / Employee).
- **Dashboard:** Interactive statistics and charts using Recharts.
- **Employee Management:** Full CRUD operations for employees.
- **Equipment Management:** Full CRUD and assignments.
- **Leave Requests:** Submissions by employees, approvals by admins.

## Setup Instructions

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

The database seeder automatically creates the following accounts:

- **Admin Account:** `admin@hr.com` / `password`
- **Employee Account:** `employee1@hr.com` / `password`

## Design Highlights

- Responsive and modular UI using Tailwind CSS custom color themes.
- Secure HTTP Bearer token implementation using Axios interceptors.
- Modern routing and Context API authentication flows.
- Cascading deletes and solid relational database logic.

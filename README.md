<div align="center">

# 🏢 HR & Equipment Management System

**Full-stack dashboard to manage employees, equipment and leave requests**

![Laravel](https://img.shields.io/badge/Laravel_11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

## Overview

A company back office where admins manage staff and equipment, and employees request leave. The Laravel REST API uses **Sanctum token authentication** and **role-based access**, and the React front-end shows live statistics with charts.

## Features

- **Authentication and roles**: Admin and Employee, with Bearer tokens (Sanctum)
- **Dashboard**: interactive statistics and charts (Recharts)
- **Employees**: full CRUD
- **Equipment**: full CRUD and assignment to employees
- **Leave requests**: employees submit, admins approve or reject
- **Clean data model**: relational schema with cascading deletes

## Tech stack

| Layer | Technologies |
|---|---|
| Back-end | Laravel 11, Sanctum, Eloquent ORM |
| Database | SQLite (PostgreSQL-ready) |
| Front-end | React 19, Vite, Tailwind CSS 4, React Router 7, Recharts, Axios, Lucide icons |

## Getting started

```bash
# Back-end
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve

# Front-end
cd ../frontend
npm install
npm run dev
```

The seeder creates demo accounts: `admin@hr.com` and `employee1@hr.com` (password: `password`).

## Project structure

```
backend/    Laravel API: models, controllers, routes, migrations, seeders
frontend/
  src/pages     dashboard, employees, equipment, leave requests
  src/contexts  authentication context
  src/layouts   app layout and navigation
  src/lib       Axios client with token interceptor
```

---

Built by [Ayman Dhib](https://www.linkedin.com/in/ayman-dhib/)

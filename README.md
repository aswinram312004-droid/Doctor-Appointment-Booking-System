# Doctor Appointment Booking System

A modern, full-stack **Doctor Appointment Booking System** built with **React 19 + Vite** (frontend) and **Node.js + Express** (backend). It allows patients to browse doctors, book appointments, and manage their health journey, while admins can manage doctors and the system.

The project features a clean, responsive UI with Tailwind CSS, smooth animations, role-based authentication (Patient & Admin), and a simple yet functional backend API.

**Live Demo** (if deployed): [Add your deployment link here]  
**Repository**: https://github.com/aswinram312004-droid/Doctor-Appointment-Booking-System

## ✨ Features

### For Patients
- User registration and login
- Browse and search doctors by name or specialization
- View doctor profiles with availability
- Book appointments (frontend integration ready)
- Responsive design with modern UI/UX (gradient hero, heartbeat animations, etc.)

### For Admins
- Add, edit, deactivate, or delete doctors
- Manage doctor availability and slot duration
- View total/active doctors count
- Protected admin routes

### General
- JWT-based authentication
- Role-based access (patient/admin)
- Form validation with real-time feedback
- Beautiful, accessible UI using Lucide icons and Tailwind
- How it works section, services, testimonials, stats

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite
- React Router DOM v7
- Tailwind CSS v4 (with custom animations)
- Lucide React (icons)
- ESLint + basic setup

**Backend (assumed/inferred):**
- Node.js + Express
- JWT for authentication
- Likely MongoDB/PostgreSQL/MySQL (not visible in provided files)
- RESTful API endpoints

## 📋 Assumptions Made

Since the full backend code is not included in the uploaded files (only frontend + `.git` metadata), the following assumptions were made while creating this README:

1. The backend runs on `http://localhost:5000` (as hardcoded in frontend fetch calls).
2. Authentication uses JWT stored in `localStorage` (token + user data).
3. Roles: `patient` and `admin`.
4. Doctor model includes fields like: `id`, `name`, `specialization`, `email`, `phone`, `available_from`, `available_to`, `slot_minutes`, `is_active`.
5. Endpoints follow standard REST patterns (e.g., `/auth/signup`, `/auth/login`, `/doctors`).
6. No real-time features (WebSocket/Socket.io) are implemented yet.
7. Appointment booking logic is partially implemented on frontend (UI ready); full CRUD may need backend completion.
8. Database connection and environment variables (e.g., `JWT_SECRET`, DB URI) are handled in the backend (`.env` file not provided).
9. Images/assets like `/images/heero.png` should be placed in `public/` folder.
10. The project was initialized as a single repo with frontend in root (or `frontend/` subfolder).

If your backend differs significantly, update the API section accordingly.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/aswinram312004-droid/Doctor-Appointment-Booking-System.git
cd Doctor-Appointment-Booking-System

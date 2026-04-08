# MediCare – Doctor Appointment Booking System

A full-stack web application that enables patients to book doctor appointments and allows administrators to manage doctors and schedules.

Built using **React (Frontend)** and **Flask + PostgreSQL (Backend)**.

---

## Features

* User registration and login (JWT authentication)
* Browse doctors by specialization
* Book and manage appointments
* Admin controls for doctor management
* Responsive UI for mobile and desktop

---

## Project Structure

```
medbook/
├── frontend/    # React application
├── backend/     # Flask API
└── README.md
```

---

## Setup Instructions

### Backend (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create `.env` file:

```
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/medbook
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
```

Run backend:

```bash
python app.py
```

Backend runs at: `http://localhost:5000`

---

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## API Documentation

Base URL:

```
http://localhost:5000/api
```

### Authentication

* `POST /auth/register` → Register user
* `POST /auth/login` → Login user

### Doctors

* `GET /doctors` → Get all doctors
* `GET /doctors/:id` → Get doctor details

### Appointments

* `GET /appointments` → Get user appointments
* `POST /appointments` → Book appointment
* `PUT /appointments/:id/cancel` → Cancel appointment

> Protected routes require JWT token.

---

## Assumptions

* PostgreSQL is used as the database
* JWT is used for authentication
* Admin role manages doctors
* Appointment conflicts are prevented at database level
* Application is configured for local development


## Screenshots

### Landing Page
https://github.com/aswinram312004-droid/Doctor-Appointment-Booking-System/blob/main/landingpage.jpeg

### Database Page
https://github.com/aswinram312004-droid/Doctor-Appointment-Booking-System/blob/main/Database.png


### Booking Page


### Appointments Dashboard



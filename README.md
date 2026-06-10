# GreenGauge – Carbon Footprint Awareness Platform

> **Measure your environmental footprint. Make every action count.**

A full-stack web application built with **React + Vite** (frontend) and **FastAPI** (backend).

---

## 🚀 Quick Start

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

---

## 📁 Project Structure

```
carbon/
├── backend/
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   │   ├── carbon_engine.py       # CO₂ calculation
│   │   │   └── recommendation_engine.py
│   │   ├── utils/security.py  # JWT & password hashing
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/            # All page components
│   │   ├── components/       # Shared components
│   │   ├── store/            # Redux slices
│   │   ├── services/api.js   # Axios service layer
│   │   └── index.css         # Global design system
│   └── package.json
└── README.md
```

---

## ✨ Features

| Feature | Status |
|---|---|
| Landing Page (particle animation, counters) | ✅ |
| JWT Authentication (register/login) | ✅ |
| Dashboard (charts, eco score, stat cards) | ✅ |
| Multi-step Carbon Calculator | ✅ |
| History with filters & CSV export | ✅ |
| Personalized Recommendations | ✅ |
| Environmental Awareness Hub | ✅ |
| Profile & Settings (theme, password) | ✅ |
| Dark / Light Theme Toggle | ✅ |

---

## 🎨 Tech Stack

- **Frontend**: React 18, Vite, Redux Toolkit, Recharts, React Router v6
- **Backend**: FastAPI, SQLAlchemy (async), SQLite → PostgreSQL-ready
- **Auth**: JWT (access + refresh tokens), bcrypt password hashing
- **Design**: Glassmorphism, CSS variables, dark/light themes

---

## 🌍 Carbon Calculation

Emission factors from:
- IPCC AR5 (2014)
- UK DEFRA 2023 Conversion Factors
- EPA GHG Inventories

Categories: Transportation, Energy, Food & Diet, Waste Management

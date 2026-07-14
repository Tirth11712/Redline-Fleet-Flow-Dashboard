# REDLINE — Fleet Operations Console 🚛⚡

**REDLINE** is a centralized transport operations platform for logistics companies. It replaces manual spreadsheets with a single system covering the full lifecycle of fleet management.

## Project Structure

```
TransitOps/
├── backend/    ← Laravel 11 REST API (PHP 8.2+)
└── frontend/   ← Next.js 16 (React 19, TypeScript)
```

---

## 🚀 Features

- **Interactive Live Tracking:** Real-time truck routing on Leaflet maps, powered by Geoapify Routing API
- **Vehicle & Driver Management:** Business rule enforcement (no double-booking, license checks, capacity limits)
- **Trip Lifecycle Engine:** Draft → Dispatched → Completed, with automatic resource locking
- **Cost Analytics:** Fuel costs, maintenance expenses, trip profitability
- **Role-Based Access Control:** Fleet Manager, Driver, Safety Officer, Financial Analyst

---

## 🛠️ Tech Stack

**Frontend** (`frontend/`)
- Next.js 16, React 19, TypeScript 5.7
- Tailwind CSS 4, Framer Motion, Recharts
- Leaflet + React-Leaflet (maps), Geoapify (routing)

**Backend** (`backend/`)
- Laravel 11, PHP 8.2+
- JWT Auth, Spatie RBAC, DomPDF
- SQLite (default) or MySQL

---

## 💻 Getting Started

### 1. Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API runs at **http://localhost:8000**

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_GEOAPIFY_KEY
npm install   # or: pnpm install
npm run dev   # or: pnpm dev
```

App runs at **http://localhost:3000**

---

## 🗺️ Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_GEOAPIFY_KEY` | Geoapify API key for map routing ([get one free](https://www.geoapify.com/)) |

### Backend (`backend/.env`)

Copy from `.env.example`. Key settings:
- `DB_CONNECTION=sqlite` (default) or configure MySQL
- `JWT_SECRET` — generated via `php artisan jwt:secret`

---

## 📄 License

Built as a Hackathon Blueprint. All rights reserved.

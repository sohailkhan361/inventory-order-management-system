# Inventory & Order Management System

A full-stack inventory dashboard with a FastAPI/PostgreSQL API and a React/Vite client. It manages products, customers, and orders; order placement snapshots prices and adjusts stock in the same database transaction.

## Repository layout

```text
backend/   FastAPI, SQLAlchemy, PostgreSQL, and Alembic configuration
frontend/  React 19, Vite 8, Tailwind CSS 4 dashboard
docs/      Installation, architecture, and API reference
```

## Quick start

Prerequisites:

- Python 3.10 or newer
- Node.js 20.19+ or 22.12+
- PostgreSQL 14+ (the project was verified with PostgreSQL 14)

Create a PostgreSQL database, then run the backend:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit DATABASE_URL in .env.
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, run the frontend:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:5173. The API health check is at http://127.0.0.1:8000/health and Swagger UI is at http://127.0.0.1:8000/docs.

## Documentation

- **Getting Started**
  - [Installation and troubleshooting](docs/installation.md)
  - [Architecture & design decisions](docs/architecture.md)
  - [API reference](docs/api.md)

- **Backend & Frontend**
  - [Backend guide](backend/README.md)
  - [Frontend guide](frontend/README.md)

- **Containerization & Deployment** (Choose your path)
  - 🚀 **First time with Docker?** → [Docker Quick Start](docs/docker-quick-start.md) (recommended)
  - 📦 **Docker setup guide** → [Docker & Deployment Guide](docs/deployment.md)
  - 🔧 **Environment variables reference** → [Environment Variables](docs/environment-variables.md)

## Containers and free-tier hosting

The backend and frontend are independent deployable applications that can be containerized and deployed to cloud platforms at no cost:

```
┌─────────────────────────────────┐
│ Vercel (Free)                   │
│ React + Vite Frontend           │
│ https://your-app.vercel.app     │
└─────────────────────────────────┘
              ↓ API calls
┌─────────────────────────────────┐
│ Render (Free)                   │
│ FastAPI Backend                 │
│ https://your-api.onrender.com   │
│ + PostgreSQL Database           │
└─────────────────────────────────┘
```

**Backend Docker build** (Render-ready):
```bash
docker build -t inventory-order-backend ./backend
```

**Frontend Docker build** (local testing, Vercel builds natively):
```bash
docker build --build-arg VITE_API_URL=http://127.0.0.1:8000/api/v1 \
  -t inventory-order-frontend ./frontend
```

### Ready to Deploy?

1. **New to Docker?** → Start with [Docker Quick Start](docs/docker-quick-start.md)
2. **Want details?** → Read [Docker & Deployment Guide](docs/deployment.md)
3. **Need help with environment setup?** → See [Environment Variables Reference](docs/environment-variables.md)

## Verified commands

The following were run successfully on 2026-06-20:

```bash
cd frontend && npm run lint
cd frontend && npm run build
cd backend && venv/bin/python -m compileall -q app
```

Both development servers were started, and live requests to `/health`, `/api/v1/products/`, `/api/v1/customers/`, `/api/v1/orders/`, and the Vite root page succeeded against PostgreSQL.

## Current limitations

- There is no automated test suite yet.
- Authentication and authorization are not implemented.
- CORS allows every origin for local development; restrict it before production deployment.
- Alembic is configured, but no migration revision is committed. The API currently creates missing tables at startup with `Base.metadata.create_all()`.

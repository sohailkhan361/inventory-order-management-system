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

## Project Preview
1. <img width="1351" height="757" alt="Screenshot 2026-06-20 at 3 05 39 PM" src="https://github.com/user-attachments/assets/e8e1c4c2-b184-4367-9b68-0ccbe5d7cf24" />
2. <img width="1352" height="756" alt="Screenshot 2026-06-20 at 3 05 46 PM" src="https://github.com/user-attachments/assets/452e163d-c0f9-42ee-992d-50a012dd5bce" />
3. <img width="1352" height="758" alt="Screenshot 2026-06-20 at 3 05 53 PM" src="https://github.com/user-attachments/assets/6ff2ea27-f3ee-4f6a-9615-a4717381650f" />
4. <img width="1352" height="757" alt="Screenshot 2026-06-20 at 3 06 00 PM" src="https://github.com/user-attachments/assets/ac10b542-8508-40ac-881b-fecb59e89216" />
5. <img width="1352" height="756" alt="Screenshot 2026-06-20 at 3 06 09 PM" src="https://github.com/user-attachments/assets/21d14177-e9ea-42c3-97f2-249eeddc73a3" />
6. <img width="1351" height="759" alt="Screenshot 2026-06-20 at 3 06 18 PM" src="https://github.com/user-attachments/assets/01061ef9-bc96-43f4-91b1-a7d518716480" />
7. <img width="1352" height="757" alt="Screenshot 2026-06-20 at 3 06 25 PM" src="https://github.com/user-attachments/assets/3264b5cd-ce25-465d-ade7-3d0bebe00d2a" />
8. <img width="1352" height="755" alt="Screenshot 2026-06-20 at 3 06 46 PM" src="https://github.com/user-attachments/assets/b7e4c6e7-196d-4979-9c46-4773e1a7dee0" />
9. <img width="1352" height="759" alt="Screenshot 2026-06-20 at 3 06 54 PM" src="https://github.com/user-attachments/assets/934eb862-3ec7-4cf0-b9a1-67b46cd2b270" />
10. <img width="1352" height="757" alt="Screenshot 2026-06-20 at 3 07 08 PM" src="https://github.com/user-attachments/assets/1f69e5f3-c4b8-49eb-a6cf-a3227b8846a1" />
11. <img width="1352" height="803" alt="Screenshot 2026-06-20 at 3 08 07 PM" src="https://github.com/user-attachments/assets/6ccd368d-eac3-400b-8704-a454f9e39607" />
12. <img width="1352" height="802" alt="Screenshot 2026-06-20 at 3 08 16 PM" src="https://github.com/user-attachments/assets/492e9e87-48de-420e-b97d-2c3d5f42fb6e" />
13. <img width="1352" height="805" alt="Screenshot 2026-06-20 at 3 09 04 PM" src="https://github.com/user-attachments/assets/06a611fb-f02a-45ce-8c92-552557f7a159" />







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

- [Installation and troubleshooting](docs/installation.md)
- [Backend guide](backend/README.md)
- [Frontend guide](frontend/README.md)
- [API reference](docs/api.md)
- [Architecture](docs/architecture.md)

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

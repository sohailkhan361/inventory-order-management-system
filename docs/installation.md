# Installation and local development

## Prerequisites

- Python 3.10+
- Node.js `^20.19.0` or `>=22.12.0`
- npm
- PostgreSQL 14+

The project was verified on macOS with Python 3.13, Node.js 23, npm 10, and PostgreSQL 14.

## 1. Create the database

Start PostgreSQL and create a database. For a local default user:

```bash
createdb inventory_db
```

Or from `psql`:

```sql
CREATE DATABASE inventory_db;
```

If your username, password, host, port, or database differs, reflect it in the backend URL below.

## 2. Start the backend

From the repository root:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
```

Run the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The current application creates missing tables on startup. Alembic is configured, but the repository does not yet contain a migration revision; see [the backend guide](../backend/README.md#database-schema-management) before adopting Alembic for deployments.

## 3. Start the frontend

In another terminal, from the repository root:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev -- --host 127.0.0.1
```

The example configuration points to:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

Open http://127.0.0.1:5173. Restart Vite after changing `.env`.

## 4. Verify the installation

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/v1/products/
curl http://127.0.0.1:8000/api/v1/customers/
curl http://127.0.0.1:8000/api/v1/orders/
```

A new database returns empty paginated collections such as `{"total":0,"items":[]}`. Also check:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- Frontend: http://127.0.0.1:5173

Create a customer and product before placing an order. Cancelling an order deletes it and restores its product quantities.

## Quality checks

```bash
cd backend
venv/bin/python -m compileall -q app

cd ../frontend
npm run lint
npm run build
```

For container builds and separate Render/Vercel deployment, continue with [the deployment guide](deployment.md).

## Troubleshooting

### PostgreSQL connection errors

- Confirm the service is running: `pg_isready -h localhost -p 5432`.
- Confirm the database exists: `psql -l`.
- Check every component of `DATABASE_URL`, including URL-encoding special characters in credentials.
- Run Uvicorn from `backend/` so `.env` is discovered consistently.

### Frontend network errors

- Verify the health endpoint first.
- Ensure `VITE_API_URL` includes `/api/v1` and has no unintended path after it.
- Restart Vite after modifying `.env`.
- Use the same hostname family consistently (`127.0.0.1` or `localhost`) when diagnosing local proxy/security software.

### Port already in use

Choose other ports and update the frontend URL, for example:

```bash
uvicorn app.main:app --reload --port 8001
VITE_API_URL=http://127.0.0.1:8001/api/v1 npm run dev -- --port 5174
```

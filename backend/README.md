# Backend

FastAPI REST API backed by PostgreSQL and synchronous SQLAlchemy sessions.

## Requirements

- Python 3.10+
- PostgreSQL 14+
- A database and user represented by `DATABASE_URL`

## Configure and run

From `backend/`:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
```

Start PostgreSQL, then launch the API:

```bash
source venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On startup, the application imports all models and creates missing tables. Successful startup includes `Database tables are ready` and `Application startup complete` in the log.

Verify it:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok","version":"1.0.0"}
```

Useful URLs:

- API root: http://127.0.0.1:8000/
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- API prefix: `http://127.0.0.1:8000/api/v1`

## Database schema management

Alembic is wired to the models and reads `DATABASE_URL`, but `alembic/versions/` has no committed revisions. For the current repository, application startup creates the initial tables. Before using migrations as the deployment source of truth, create and review an initial revision:

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

Commit the generated revision. Do not generate a fresh “initial” migration independently in each environment.

## Structure

```text
app/main.py              application, middleware, handlers, health route
app/database/session.py  engine, session factory, database dependency
app/models/              SQLAlchemy tables and relationships
app/schemas/             Pydantic request/response models
app/services/            transactions and business rules
app/routers/             HTTP routes under /api/v1
alembic/                 migration environment (no revisions yet)
```

## API overview

- Products: list, fetch, create, fully update, delete
- Customers: list, fetch, create, delete
- Orders: list, fetch, place, cancel (restores inventory)

See [the API reference](../docs/api.md) for payloads and response fields.

## Checks

```bash
venv/bin/python -m compileall -q app
```

There is currently no backend automated test suite.

## Production notes

- Replace `allow_origins=["*"]` with trusted frontend origins.
- Use a dedicated database role and do not commit `.env`.
- Add committed Alembic revisions and run `alembic upgrade head` during deployment.
- Configure process management, HTTPS, secrets, logging, and database backups outside this development server.

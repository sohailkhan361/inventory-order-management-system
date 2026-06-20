# FastAPI Backend — Inventory & Order Management System

This directory houses the REST API backend service, built using FastAPI, PostgreSQL, SQLAlchemy ORM, and Alembic migrations.

---

## 🐍 Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (high performance, asynchronous support, auto-generated OpenAPI documentation)
- **Database Engine**: [PostgreSQL](https://www.postgresql.org/) (relational database with strong ACID compliance)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (declarative object-relational mapper)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/) (lightweight database schema migration tool)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/) (data parsing and validation schemas)

---

## 🏛️ Code Structure

```
backend/
├── alembic.ini             # Alembic migration configurations
├── alembic/                # Migration scripts & env controls
├── app/
│   ├── main.py             # FastAPI entrypoint, CORS configurations, error handlers
│   ├── database/
│   │   └── session.py      # SQLAlchemy connection pool engines & DB dependencies
│   ├── models/             # SQLAlchemy ORM model declarations
│   ├── schemas/            # Pydantic schema validation structures
│   ├── services/           # Services implementing critical transaction business rules
│   └── routers/            # Routing endpoints mapping HTTP requests to services
└── requirements.txt        # PIP dependencies manifest
```

---

## 🚀 Quickstart Guide

For step-by-step database creation and detailed configurations, refer to the [🚀 General Setup Guide](file:///Users/sohailkhan/Documents/POC/inventory-order-management-system/docs/installation.md). Below is a quick setup summary:

### 1. Setup Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
```

### 3. Generate & Apply Migrations
```bash
alembic revision --autogenerate -m "initial_schema"
alembic upgrade head
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **API Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🔌 API Summary
- **Products**: GET `/products/`, POST `/products/`, PUT `/products/{id}`, DELETE `/products/{id}`
- **Customers**: GET `/customers/`, POST `/customers/`, DELETE `/customers/{id}`
- **Orders**: GET `/orders/`, POST `/orders/`, GET `/orders/{id}`, DELETE `/orders/{id}`

For complete descriptions of request payloads, URL parameters, and status codes, see [🔌 Detailed API Docs](file:///Users/sohailkhan/Documents/POC/inventory-order-management-system/docs/api.md).

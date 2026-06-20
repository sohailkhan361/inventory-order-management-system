# Project Installation Guide

Follow these steps to set up, configure, and launch the Inventory & Order Management System locally.

---

## 📋 Prerequisites
Ensure you have the following software installed on your development machine:
- **Python** (v3.9 or higher)
- **Node.js** (v18.0 or higher, with `npm` package manager)
- **PostgreSQL Database Server** (locally or running in a Docker container)

---

## 🗄️ Step 1: Set Up PostgreSQL Database

1. Connect to your PostgreSQL server using `psql` or your preferred SQL editor (like pgAdmin or DBeaver).
2. Create a new empty database for the system:
   ```sql
   CREATE DATABASE inventory_db;
   ```
3. Record your database connection parameters:
   - **Host**: `localhost` (default)
   - **Port**: `5432` (default)
   - **Username**: e.g., `postgres`
   - **Password**: e.g., `postgres`
   - **Database Name**: `inventory_db`

---

## 🐍 Step 2: Set Up Backend Service

1. Open your terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Initialize and activate a Python virtual environment:
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install all PIP package dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file under `backend/` to define the database connection string:
   ```env
   # Format: postgresql://[user]:[password]@[host]:[port]/[database]
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
   ```
5. Generate and execute SQL migrations to align the database schemas:
   ```bash
   # Generate initial migration classes
   alembic revision --autogenerate -m "initial_schema"

   # Apply migrations to database
   alembic upgrade head
   ```
6. Start the development server using Uvicorn:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The server will spin up on [http://localhost:8000](http://localhost:8000).*

---

## ⚡ Step 3: Set Up Frontend Application

1. Open a new terminal tab and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm project package requirements:
   ```bash
   npm install
   ```
3. Create a local `.env` configuration file inside `frontend/` (Optional: defaults to localhost if blank):
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```
4. Launch the Vite development build server:
   ```bash
   npm run dev
   ```
   *The client web page runs on [http://localhost:5173](http://localhost:5173).*

---

## 🔍 Step 4: Verification Checklist

Check that the configuration is working as expected:
1. Open [http://localhost:8000/health](http://localhost:8000/health) in your browser. It should respond with `{"status":"ok"}`.
2. Open [http://localhost:8000/docs](http://localhost:8000/docs) to view the generated Swagger interactive documentation.
3. Open [http://localhost:5173/](http://localhost:5173/) to view the dark SaaS dashboard.
4. Try creating a product:
   - Navigate to the **Products** page.
   - Click **Add Product** and fill in details (Name: `Demo Mouse`, SKU: `MOUSE-01`, Price: `25.00`, Stock: `100`).
   - Submit the form. A success toast should appear in the bottom-right corner, and the product table should list the new item.

---

## 🛠️ Troubleshooting

### 1. Database Connection Failures
If Alembic migrations fail with connection timeouts:
- Double check that your local PostgreSQL instance is running.
- Ensure the credentials in your `backend/.env` file match your Postgres settings.
- Verify the DB name in Postgres matches exactly: `inventory_db`.

### 2. CORS Errors
If the frontend fails to pull data and the developer tools console shows CORS blocking issues:
- Verify that the CORS origins list in `backend/app/main.py` permits requests from `http://localhost:5173` (Vite's default address).

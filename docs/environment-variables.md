# Environment Variables Reference

This document explains all environment variables used in development, testing, and production.

---

## Backend Environment Variables

### Local Development

**File**: `backend/.env` (create from `backend/.env.example`)

```env
# Database connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

# CORS allowed origins (comma-separated)
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173

# Optional: Application environment
ENVIRONMENT=development
```

### Production (Render)

**Set via Render Dashboard** → Service → Environment

```env
# Auto-provisioned by Render from database
DATABASE_URL=postgresql://inventory_user:PASSWORD@prod-db-host:5432/inventory_db

# Restrict to frontend domain only
CORS_ORIGINS=https://your-frontend.vercel.app

# Tell app it's production
ENVIRONMENT=production
```

---

## Frontend Environment Variables

### Local Development

**File**: `frontend/.env` (create from `frontend/.env.example`)

```env
# Backend API URL compiled into the bundle
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

### Production (Vercel)

**Set via Vercel Dashboard** → Project → Settings → Environment Variables

```env
# Point to production backend
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

---

## How Environment Variables Work

### Backend (FastAPI)

1. **Read at startup**: Variables loaded from `.env` file or system environment
2. **Used in code**: `os.getenv("DATABASE_URL")`
3. **Cloud deployment**: Override `.env` with cloud provider's variables

**Example** (`backend/app/main.py`):
```python
import os
from fastapi.middleware.cors import CORSMiddleware

# Read from environment
cors_origins = os.getenv("CORS_ORIGINS", "http://127.0.0.1:5173").split(",")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    ...
)
```

### Frontend (Vite)

1. **Compile during build**: Variables baked into JavaScript bundle
2. **Accessed in code**: `import.meta.env.VITE_API_URL`
3. **Cloud deployment**: Set variables before building

**Example** (`frontend/src/services/api.js`):
```javascript
const apiBaseUrl = import.meta.env.VITE_API_URL || 
                   'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: apiBaseUrl
});
```

---

## Variable Definitions

### `DATABASE_URL`

**Purpose**: PostgreSQL connection string  
**Format**: `postgresql://user:password@host:port/database`  
**Example**:
- Local: `postgresql://postgres:postgres@localhost:5432/inventory_db`
- Render: `postgresql://inventory_user:xyz@prod-xxxx.onrender.com/inventory_db`

**Provided by**: You (locally) or Render (cloud)

### `CORS_ORIGINS`

**Purpose**: Which domains can call the API  
**Format**: Comma-separated URLs  
**Examples**:
- Local dev: `http://127.0.0.1:5173,http://localhost:5173`
- With Docker: `http://127.0.0.1:8080`
- Production: `https://my-app.vercel.app`
- All origins: `*` (⚠️ security risk - use only for testing)

**Security**: Always restrict in production. Use exact domain.

### `VITE_API_URL`

**Purpose**: Backend API endpoint for frontend  
**Format**: Full URL with protocol and path  
**Examples**:
- Local dev: `http://127.0.0.1:8000/api/v1`
- Docker: `http://127.0.0.1:8000/api/v1`
- Production: `https://your-backend.onrender.com/api/v1`

**Important**: Vite compiles this into the bundle. Change requires rebuild.

### `ENVIRONMENT`

**Purpose**: Indicates deployment environment  
**Values**: `development` or `production`  
**Impact**: Affects logging, error messages, performance tuning

---

## Deployment Workflows

### Scenario 1: Local Development

**Backend**:
```bash
cd backend
cp .env.example .env
# Edit .env - set DATABASE_URL to local PostgreSQL
source venv/bin/activate
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
cp .env.example .env
# Edit .env - set VITE_API_URL=http://127.0.0.1:8000/api/v1
npm run dev
```

### Scenario 2: Local Docker Testing

**Backend**:
```bash
docker build -t backend:latest backend/
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/inventory_db \
  -e CORS_ORIGINS=http://127.0.0.1:8080 \
  backend:latest
```

**Frontend**:
```bash
docker build \
  --build-arg VITE_API_URL=http://127.0.0.1:8000/api/v1 \
  -t frontend:latest frontend/
docker run -p 8080:8080 frontend:latest
```

### Scenario 3: Render + Vercel

**Backend (Render)**:
- Render provides `DATABASE_URL` automatically
- Set `CORS_ORIGINS` to your Vercel URL
- Set via Render Dashboard or `render.yaml`

**Frontend (Vercel)**:
- Set `VITE_API_URL` to your Render URL
- Set via Vercel Dashboard
- Vercel rebuilds on every push to GitHub

---

## Checklist: Before Deploying

- [ ] Backend `.env.example` updated with all variables
- [ ] Frontend `.env.example` updated with all variables
- [ ] `.gitignore` excludes `.env` files
- [ ] Local `.env` files not committed to Git
- [ ] Environment variables documented here
- [ ] Backend tested locally with Docker
- [ ] Frontend tested locally
- [ ] Production URLs determined
- [ ] Render blueprint ready with correct variables
- [ ] Vercel project ready with correct variables

---

## Security Best Practices

✅ **DO**:
- Use `.env.example` as template (never commit actual `.env`)
- Use strong, random database passwords
- Restrict `CORS_ORIGINS` to your domain in production
- Use HTTPS URLs in production
- Rotate credentials regularly
- Use cloud provider's secret management

❌ **DON'T**:
- Commit `.env` files with real values to Git
- Use `CORS_ORIGINS=*` in production
- Hardcode secrets in code
- Share environment variables publicly
- Use same password for dev and prod
- Commit API keys or tokens

---

## Troubleshooting

### Frontend shows "Cannot connect to API"

1. Check `VITE_API_URL` in browser → DevTools → Network
2. Verify it points to correct backend
3. Check if backend is running
4. Verify `CORS_ORIGINS` on backend includes frontend URL

**Debug**:
```javascript
// In browser console
console.log(import.meta.env.VITE_API_URL)
// Should show your backend URL
```

### Backend rejects requests from frontend

**Cause**: `CORS_ORIGINS` doesn't include frontend URL

**Fix**:
1. Identify frontend URL (check browser address bar)
2. Add to `CORS_ORIGINS` (exact match required)
3. Restart backend or redeploy to cloud

### Database connection fails

**Cause**: `DATABASE_URL` incorrect or unreachable

**Fix**:
1. Verify connection string format
2. Test locally: `psql $DATABASE_URL`
3. Check if PostgreSQL is running
4. On Docker Desktop, use `host.docker.internal` not `localhost`

---

## Quick Reference

| Variable | Backend | Frontend | Where Set |
|----------|---------|----------|-----------|
| `DATABASE_URL` | ✅ | ❌ | `.env` or Render |
| `CORS_ORIGINS` | ✅ | ❌ | `.env` or Render |
| `VITE_API_URL` | ❌ | ✅ | `.env` or Vercel |
| `ENVIRONMENT` | ✅ | ❌ | `.env` or cloud |

---

## Learn More

- [Render Documentation](https://render.com/docs/environment-variables)
- [Vercel Documentation](https://vercel.com/docs/projects/environment-variables)
- [FastAPI Environment Variables](https://fastapi.tiangolo.com/advanced/settings/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

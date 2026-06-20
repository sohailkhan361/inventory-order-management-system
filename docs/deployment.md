# Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide covers deploying the Inventory & Order Management System with:
- **Backend**: FastAPI + PostgreSQL on Render (free tier)
- **Frontend**: React + Vite on Vercel (free tier)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│ Vercel (Frontend) - React + Vite                    │
│ - Deployed at: https://your-app.vercel.app         │
│ - Auto-builds & deploys on Git push                 │
└─────────────────────────────────────────────────────┘
                         ↓ API calls
┌─────────────────────────────────────────────────────┐
│ Render (Backend) - FastAPI + PostgreSQL             │
│ - API at: https://your-api.onrender.com            │
│ - Database auto-created by Render Blueprint         │
│ - Spins down after 15 min inactivity (free tier)    │
└─────────────────────────────────────────────────────┘
```

---

## What Docker Does Here

A **Docker image** packages an application, its runtime, and dependencies. A **container** is a running instance of that image.

- `backend/Dockerfile` - Packages Python 3.13, FastAPI, and Uvicorn with multi-stage optimization
- `frontend/Dockerfile` - Builds Vite app and serves static files with Nginx (optional for Vercel)
- **Render** - Builds and runs the backend container from `backend/Dockerfile`
- **Vercel** - Does **not** use Docker; it builds the frontend natively from `frontend/` directory

---

## Part 1: Local Testing with Docker

### Build and Run Backend Container

Requires a reachable PostgreSQL database:

```bash
# Build the image
docker build -t inventory-order-backend ./backend

# Run the container
docker run --rm -p 8000:8000 \
  -e DATABASE_URL=postgresql://USER:PASSWORD@DATABASE_HOST:5432/inventory_db \
  -e CORS_ORIGINS=http://127.0.0.1:8080 \
  inventory-order-backend
```

**Tip**: On Docker Desktop, use `host.docker.internal` to reach local PostgreSQL:
```bash
-e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/inventory_db
```

Verify: `curl http://127.0.0.1:8000/health`

### Build and Run Frontend Container

Vite compiles `VITE_API_URL` into the bundle during build:

```bash
# Build the image
docker build \
  --build-arg VITE_API_URL=http://127.0.0.1:8000/api/v1 \
  -t inventory-order-frontend ./frontend

# Run the container
docker run --rm -p 8080:8080 inventory-order-frontend
```

Open: `http://127.0.0.1:8080`

**Important**: Rebuild the image if `VITE_API_URL` changes.

---

## Part 2: Deploy Backend to Render

### Prerequisites

- Render account (free at https://render.com)
- GitHub/GitLab repository with this code
- Repository is public or connected to Render

### Deployment Steps

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com)**

3. **Create Blueprint**
   - Click **"New +"** → **"Blueprint"**
   - Select your GitHub repository
   - Render auto-detects `render.yaml`

4. **Review Blueprint**
   - Service: `inventory-order-api` (FastAPI backend)
   - Database: `inventory-order-db` (PostgreSQL 18)
   - Region: Singapore (or your preferred region)

5. **Configure Environment Variables**
   - `CORS_ORIGINS`: Set to `*` for now (we'll restrict after Vercel deployment)
   - Other variables auto-populated from `render.yaml`

6. **Deploy**
   - Click **"Deploy Blueprint"**
   - Wait 5-10 minutes for build and deployment

### Verify Backend Deployment

Once deployed:

```bash
# Test health endpoint
curl https://YOUR-RENDER-SERVICE.onrender.com/health
# Expected: {"status":"ok","version":"1.0.0"}

# Test API
curl https://YOUR-RENDER-SERVICE.onrender.com/api/v1/products/

# Access Swagger UI
# https://YOUR-RENDER-SERVICE.onrender.com/docs
```

**Save your backend URL**: You'll need it for frontend deployment.

### Render Free Tier Limits

⚠️ **Important**: Be aware of free tier limitations:
- Web service spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- PostgreSQL limited to 1 GB
- Database expires after 30 days (no backups)
- Treat as demo/testing only, not for production data

---

## Part 3: Deploy Frontend to Vercel

### Prerequisites

- Vercel account (free at https://vercel.com)
- GitHub repository connected to Vercel
- Backend URL from Part 2

### Deployment Steps

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Add New Project**
   - Click **"Add New"** → **"Project"**
   - Import your GitHub repository

3. **Configure Build Settings**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`

4. **Set Environment Variables**
   Add for **Production** and **Preview**:
   ```
   VITE_API_URL: https://YOUR-RENDER-SERVICE.onrender.com/api/v1
   ```
   Replace with your actual Render URL from Part 2.

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes for build

### Verify Frontend Deployment

Once deployed:

```bash
# Open in browser
# https://your-app.vercel.app

# Or test with curl
curl https://your-app.vercel.app/
```

The frontend should load and connect to your Render backend.

---

## Part 4: Lock Down CORS

Now that you have both URLs, restrict backend CORS:

1. **Go to Render Dashboard**
2. **Select** `inventory-order-api` service
3. **Go to Environment** tab
4. **Update** `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://YOUR-PROJECT.vercel.app
   ```
5. **Save** - Service redeploys automatically (2 min)

---

## Testing End-to-End

### Test 1: Backend Health
```bash
curl https://your-backend.onrender.com/health
# Should return: {"status":"ok","version":"1.0.0"}
```

### Test 2: API Endpoints
```bash
# Get products
curl https://your-backend.onrender.com/api/v1/products/

# Create product
curl -X POST https://your-backend.onrender.com/api/v1/products/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","sku":"TST001","price":99.99,"quantity_in_stock":10}'
```

### Test 3: Frontend → Backend
1. Open https://your-app.vercel.app
2. Go to **Products** page
3. Should see data from Render backend
4. Try creating a product - should work end-to-end

### Test 4: CORS Verification
```bash
# From your browser console at your Vercel URL:
fetch('https://your-backend.onrender.com/api/v1/products/')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Troubleshooting

### Frontend shows "Cannot connect to API"

**Cause**: `VITE_API_URL` not set or CORS not configured

**Check**:
```bash
# 1. Verify Vercel environment variable
# Open Vercel project → Settings → Environment Variables
# Should see VITE_API_URL pointing to Render URL

# 2. Rebuild if needed
# Vercel → Deployments → Redeploy
```

### "CORS error" in browser console

**Cause**: Backend `CORS_ORIGINS` doesn't match frontend URL

**Fix**:
1. Check browser - what's your exact URL? (e.g., `https://my-app.vercel.app`)
2. Go to Render → `inventory-order-api` → Environment
3. Update `CORS_ORIGINS` to match exactly
4. Wait 2 minutes for redeploy

### Backend not responding

**Cause**: Service might be spinning up (free tier cold start)

**Check**:
```bash
# Monitor Render logs
# Render Dashboard → Select service → Logs tab
# Look for startup messages

# Or manually wake it up
curl https://your-backend.onrender.com/health
# First request takes ~30 seconds, then it's fast
```

### Database connection error

**Cause**: PostgreSQL not initialized

**Check**:
1. Render Dashboard → Select `inventory-order-db` (database)
2. Check status - should be "Available"
3. If not available, wait or restart service
4. Check backend logs for "Database tables are ready"

### Changes not deploying

**Cause**: Git integration not connected

**Fix**:
- **Render**: Service → Settings → verify GitHub integration
- **Vercel**: Project → Settings → verify GitHub integration
- Re-trigger deployment manually if needed

---

## Deployment Checklist

### Before Deploying

- [ ] Code pushed to GitHub
- [ ] `render.yaml` exists in repo root
- [ ] `frontend/vercel.json` exists
- [ ] `.gitignore` excludes `.env` and sensitive files
- [ ] Backend runs locally with `docker build` and `docker run`
- [ ] Frontend builds locally with `npm run build`

### Render Backend

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Blueprint deployed successfully
- [ ] Database created (status = Available)
- [ ] Health endpoint works: `/health`
- [ ] Backend URL copied

### Vercel Frontend

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Root directory set to `frontend`
- [ ] `VITE_API_URL` environment variable set
- [ ] Project deployed successfully
- [ ] Frontend URL copied

### Post-Deployment

- [ ] Update backend `CORS_ORIGINS` to frontend URL
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Test frontend → backend connectivity
- [ ] Check browser console for errors
- [ ] Monitor logs for 24 hours

---

## Monitoring & Maintenance

### Daily
- Visit your app - verify it loads
- Check Render logs for errors
- Monitor database growth

### Weekly
- Test API endpoints manually
- Review Render service health
- Check Vercel deployment status

### Monthly
- Review database size
- Analyze performance
- Plan upgrades if needed (free tier limits)

---

## Free Tier Cost Estimate

| Service | Provider | Cost | Limits |
|---------|----------|------|--------|
| Backend | Render | Free | 0.1 CPU, 512MB RAM, auto-sleep after 15 min |
| Database | Render | Free | 1GB storage, 30-day expiration, no backups |
| Frontend | Vercel | Free | 100GB bandwidth/month, unlimited deployments |
| **Total** | — | **$0/month** | Demo/testing only |

---

## Next Steps

1. ✅ Deploy backend to Render (Part 2)
2. ✅ Deploy frontend to Vercel (Part 3)
3. ✅ Update CORS (Part 4)
4. ✅ Run end-to-end tests
5. Share your Vercel URL! 🚀

---

## Documentation

- **Running locally**: See [README.md](../README.md)
- **Backend**: See [backend/README.md](../backend/README.md)
- **Frontend**: See [frontend/README.md](../frontend/README.md)
- **API docs**: After deploy, visit https://YOUR-RENDER-SERVICE.onrender.com/docs
- **Docker reference**: https://docs.docker.com/
- **Render docs**: https://render.com/docs
- **Vercel docs**: https://vercel.com/docs

For multiple allowed origins, use a comma-separated value without paths:

```text
CORS_ORIGINS=https://YOUR-PROJECT.vercel.app,https://www.example.com
```

Save the setting and let Render redeploy. Do not append `/api/v1` to a CORS origin.

## Deployment troubleshooting

- **Render cannot detect a port:** the service must use the included Dockerfile/CMD and must not override it with a command that binds only to `127.0.0.1`.
- **Render health check fails:** inspect logs for database connection errors and confirm the Blueprint populated `DATABASE_URL`.
- **Browser reports CORS:** `CORS_ORIGINS` must exactly match the browser origin (scheme + hostname, with no trailing slash/path).
- **Frontend calls localhost:** set `VITE_API_URL` in Vercel and redeploy; Vite embedded the fallback during the previous build.
- **Refreshing `/products` returns 404:** confirm `frontend/vercel.json` is inside the Vercel project root (`frontend`).
- **Initial API request is slow:** this is expected after a free Render web service has spun down.

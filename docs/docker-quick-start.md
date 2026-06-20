# Docker & Deployment Quick Start

**If you're new to Docker & deployment, start here!** This guide walks you through containerizing and deploying your app.

---

## What is Docker?

Docker is like a **package** for your application:
- 📦 Includes everything: Python, dependencies, code
- 🚀 Works the same everywhere (your computer, Render, etc.)
- 🔒 Isolated from your system (like a sandboxed environment)

We've already created Docker configurations for you. You just need to test them and deploy!

---

## What is Containerization?

**Containerization** = turning your application into a Docker package.

For this project:
- **Backend** is containerized → runs on Render
- **Frontend** is containerized → Vercel uses your code directly (no Docker needed there)

---

## Step 1: Understand Your Setup

### Backend (FastAPI + PostgreSQL)
- **Location**: `backend/Dockerfile`
- **What it does**: Packages Python 3.13, FastAPI, and your code
- **Deployment target**: Render (free tier)
- **Configuration**: `render.yaml` (already created)

### Frontend (React + Vite)
- **Location**: `frontend/Dockerfile` (for local testing)
- **What it does**: Builds your React app and serves it with Nginx
- **Deployment target**: Vercel (free tier)
- **Configuration**: `vercel.json` (already created)

---

## Step 2: Test Locally with Docker

### Prerequisites
- Install Docker Desktop: https://www.docker.com/products/docker-desktop
- PostgreSQL running locally (or use `host.docker.internal` on Docker Desktop)

### Test Backend Container

```bash
# Go to backend directory
cd backend

# Build the Docker image
docker build -t inventory-backend:latest .

# Run the container
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/inventory_db \
  -e CORS_ORIGINS=http://127.0.0.1:8080 \
  inventory-backend:latest
```

**Verify**:
```bash
# In a new terminal, test the API
curl http://127.0.0.1:8000/health
# Should return: {"status":"ok","version":"1.0.0"}
```

**What happened**:
1. `docker build` read your Dockerfile
2. Created a reusable image named `inventory-backend`
3. `docker run` started a container from that image
4. Your FastAPI app is now running inside a Docker container!

### Test Frontend Container

```bash
# Go to frontend directory
cd frontend

# Build the Docker image (with your backend URL)
docker build \
  --build-arg VITE_API_URL=http://127.0.0.1:8000/api/v1 \
  -t inventory-frontend:latest .

# Run the container
docker run -p 8080:8080 inventory-frontend:latest
```

**Verify**:
- Open: http://127.0.0.1:8080
- Should see your React app
- Navigate to Products page - should fetch data from backend

---

## Step 3: Prepare for Cloud Deployment

### Commit Your Code

```bash
# Ensure all Docker files are committed
git add .
git status  # Should show no uncommitted Docker changes

# Push to GitHub
git push origin main
```

### Create Accounts (Free Tier)

1. **Render**: https://render.com (backend hosting)
2. **Vercel**: https://vercel.com (frontend hosting)
3. **GitHub**: Already have it (code hosting)

---

## Step 4: Deploy Backend to Render

### 4a. Connect Repository

1. Go to https://render.com
2. Sign in with GitHub
3. Choose **"New +"** → **"Blueprint"**
4. Select your GitHub repository
5. Click **"Connect"**

### 4b. Review Configuration

Render shows:
- Service: `inventory-order-api`
- Database: `inventory-order-db`
- Plan: Free (perfect for testing)

### 4c. Set Environment Variables

In the form, set:
```
CORS_ORIGINS: *
```

(We'll lock this down later after frontend is deployed)

### 4d. Deploy

Click **"Deploy Blueprint"** and wait ~5-10 minutes.

### 4e. Verify

Once deployed:
```bash
# Replace with your actual Render URL
RENDER_URL="https://your-app-name.onrender.com"

# Test health endpoint
curl $RENDER_URL/health
# Should return: {"status":"ok","version":"1.0.0"}

# Test API
curl $RENDER_URL/api/v1/products/
```

**Save your URL**: You'll need it for the frontend!

---

## Step 5: Deploy Frontend to Vercel

### 5a. Import Project

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New"** → **"Project"**
4. Choose your repository
5. Click **"Import"**

### 5b. Configure

Set:
- **Root Directory**: `frontend`
- **Framework**: Vite (should auto-detect)

### 5c. Set Environment Variables

Add this environment variable:
```
VITE_API_URL: https://your-render-url.onrender.com/api/v1
```

Replace `your-render-url` with your actual Render URL from Step 4e.

### 5d. Deploy

Click **"Deploy"** and wait ~2-3 minutes.

### 5e. Verify

Once deployed:
- Go to your Vercel URL (shown in dashboard)
- Should see your React app
- Navigate to Products - should show data from Render backend
- Try creating a product - should work end-to-end!

---

## Step 6: Lock Down Security

Now that both are deployed, restrict backend access to your frontend only:

1. Go to https://render.com
2. Select your `inventory-order-api` service
3. Go to **Environment** tab
4. Change `CORS_ORIGINS` from `*` to:
   ```
   https://your-vercel-url.vercel.app
   ```
5. Click **Save**
6. Wait 2 minutes for Render to redeploy
7. Test again - everything should still work!

---

## What Just Happened?

```
Your Code (GitHub)
    ↓
Render (Backend) ← Pulls code, builds Docker image, runs FastAPI
PostgreSQL Database ← Created by Render
    ↓
Vercel (Frontend) ← Pulls code, builds React app, serves HTML/CSS/JS
    ↓
User's Browser
```

**Flow**:
1. User opens Vercel URL
2. Browser loads React app
3. React app calls Render API
4. Render returns data
5. Frontend displays data

---

## Handy Docker Commands

```bash
# Build image
docker build -t app-name:latest .

# Run container
docker run -p 8000:8000 app-name:latest

# List running containers
docker ps

# View container logs
docker logs container-id

# Stop container
docker stop container-id

# Remove container
docker rm container-id

# View image size
docker images
```

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker run app-name:latest
# Look at error message

# Rebuild without cache
docker build --no-cache -t app-name:latest .
```

### Backend not connecting to database
```bash
# Inside container, localhost = the container itself
# On Docker Desktop, use: host.docker.internal:5432
# In cloud (Render), database hostname provided by Render
```

### Frontend can't reach backend API
1. Check `VITE_API_URL` in Vercel environment variables
2. Check backend `CORS_ORIGINS` matches frontend URL
3. Rebuild frontend if variables changed

---

## Common Questions

### Q: Do I need Docker installed to use Render/Vercel?
**A**: No! Render and Vercel have Docker installed. You only need Docker locally to test.

### Q: Why two Docker files (backend) and (frontend)?
**A**: They're different apps with different needs:
- Backend needs Python + dependencies
- Frontend needs Node.js to build, then Nginx to serve

### Q: What if I change code?
**A**: Just push to GitHub:
```bash
git add .
git commit -m "Updated feature"
git push origin main
```
Render & Vercel automatically rebuild and redeploy!

### Q: How much will this cost?
**A**: $0! Both Render and Vercel have free tiers. Good for demos/testing.

### Q: What happens to my data?
**A**: Render free tier database lasts 30 days. Treat it as temporary for testing. Upgrade to paid for real data.

---

## Next Steps

1. ✅ Test Docker locally
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Vercel
4. ✅ Test end-to-end
5. 🎉 Share your app!

---

## Learn More

- **Docker**: https://docs.docker.com/
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/

---

## Support

- Check logs:
  - Render: Dashboard → Service → **Logs**
  - Vercel: Dashboard → Project → **Deployments** → **View Logs**
- Read error messages carefully - they often tell you exactly what's wrong!

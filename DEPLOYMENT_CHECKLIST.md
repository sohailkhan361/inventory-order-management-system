# 📝 Deployment Checklist

Use this checklist to track your deployment progress. Check off items as you complete them.

---

## Pre-Deployment (Local Testing)

### Code Preparation
- [ ] Code pushed to GitHub
- [ ] `.env` files NOT in Git (check `.gitignore`)
- [ ] `.env.example` files completed with all variables
- [ ] No hardcoded secrets in code

### Local Testing
- [ ] Docker Desktop installed and running
- [ ] PostgreSQL running locally (if testing with Docker)
- [ ] Backend Dockerfile builds successfully
  ```bash
  cd backend && docker build -t test:latest . && cd ..
  ```
- [ ] Frontend Dockerfile builds successfully
  ```bash
  cd frontend && docker build -t test:latest . && cd ..
  ```
- [ ] Backend container runs without errors
- [ ] Frontend container runs without errors
- [ ] Can access backend health endpoint
- [ ] Frontend connects to backend successfully

---

## Accounts & Prerequisites

### Platforms
- [ ] GitHub account with repository access
- [ ] Render account created (https://render.com)
- [ ] Vercel account created (https://vercel.com)
- [ ] Both accounts connected to GitHub

### Repository
- [ ] Repository is public OR connected to Render/Vercel
- [ ] `render.yaml` exists in repository root
- [ ] Backend has Dockerfile
- [ ] Frontend has vercel.json

---

## Backend Deployment (Render)

### Create Render Blueprint
- [ ] Go to Render Dashboard
- [ ] Click "New" → "Blueprint"
- [ ] Select your GitHub repository
- [ ] Render detects `render.yaml`
- [ ] Verify services listed:
  - [ ] inventory-order-api (FastAPI service)
  - [ ] inventory-order-db (PostgreSQL database)

### Configure Environment
- [ ] Set `CORS_ORIGINS` = `*` (temporary, will lock later)
- [ ] Review other environment variables
- [ ] No sensitive data exposed

### Deploy
- [ ] Click "Deploy Blueprint"
- [ ] Wait for services to become "Available"
- [ ] Database created successfully
- [ ] Backend service running

### Verify Backend
- [ ] Got Render URL (e.g., `https://xyz.onrender.com`)
- [ ] Test health endpoint:
  ```bash
  curl https://YOUR-RENDER-URL.onrender.com/health
  # Should return: {"status":"ok","version":"1.0.0"}
  ```
- [ ] Test API endpoint:
  ```bash
  curl https://YOUR-RENDER-URL.onrender.com/api/v1/products/
  ```
- [ ] Check Render logs for errors

### Save Backend URL
- [ ] Render URL copied: `https://YOUR-RENDER-URL.onrender.com`
- [ ] API URL noted: `https://YOUR-RENDER-URL.onrender.com/api/v1`

---

## Frontend Deployment (Vercel)

### Create Vercel Project
- [ ] Go to Vercel Dashboard
- [ ] Click "Add New" → "Project"
- [ ] Select your GitHub repository
- [ ] Click "Import"

### Configure Build
- [ ] Root Directory set to: `frontend`
- [ ] Framework: `Vite` (should auto-detect)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm ci`

### Set Environment Variables
- [ ] Go to "Settings" → "Environment Variables"
- [ ] Add `VITE_API_URL`
- [ ] Set value to your Render backend URL: `https://YOUR-RENDER-URL.onrender.com/api/v1`
- [ ] Apply to Production and Preview environments

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Deployment shows "Ready"
- [ ] Got Vercel URL (e.g., `https://xyz.vercel.app`)

### Verify Frontend
- [ ] Vercel URL copied: `https://YOUR-VERCEL-URL.vercel.app`
- [ ] Opened URL in browser - app loads
- [ ] No console errors
- [ ] Can navigate between pages
- [ ] Products page loads data from backend

---

## Post-Deployment Security

### Lock Down CORS
- [ ] Go to Render Dashboard
- [ ] Select `inventory-order-api` service
- [ ] Go to "Environment" tab
- [ ] Find `CORS_ORIGINS` variable
- [ ] Update from `*` to: `https://YOUR-VERCEL-URL.vercel.app`
- [ ] Click "Save"
- [ ] Wait 2 minutes for redeploy

### Verify CORS Lock
- [ ] Check Render logs show redeploy
- [ ] Frontend still works
- [ ] No new CORS errors

---

## End-to-End Testing

### API Connectivity
- [ ] Backend health check works
- [ ] Backend API endpoints work
- [ ] Frontend can reach backend

### Functionality
- [ ] Products page loads data
- [ ] Can create a product
- [ ] Can view customers
- [ ] Can create an order
- [ ] Can view all pages
- [ ] No errors in browser console

### Performance
- [ ] Frontend loads in < 5 seconds
- [ ] API calls respond in < 2 seconds
- [ ] No broken images or assets
- [ ] Styling looks correct

---

## Documentation

### Created Documentation
- [ ] `docs/deployment.md` exists
- [ ] `docs/docker-quick-start.md` exists
- [ ] `docs/environment-variables.md` exists
- [ ] `DEPLOYMENT_READY.md` exists
- [ ] README.md updated with deployment links

### Shared with Team/Users
- [ ] Shared Vercel URL
- [ ] Documented environment variables
- [ ] Documented deployment process
- [ ] Documented troubleshooting steps

---

## Monitoring Setup

### Render Monitoring
- [ ] Bookmarked Render Dashboard
- [ ] Can access service logs
- [ ] Understand log location

### Vercel Monitoring
- [ ] Bookmarked Vercel Dashboard
- [ ] Can access deployment history
- [ ] Can view build logs

### Ongoing Checks (First Week)
- [ ] Check logs daily
- [ ] Monitor for error patterns
- [ ] Verify performance is acceptable
- [ ] Test key user workflows

---

## Optional: Advanced Setup

### Auto-Redeployment
- [ ] Understand git push triggers auto-deploy
- [ ] Tested by pushing small change
- [ ] Verified auto-deployment worked

### Custom Domain (Optional)
- [ ] Decided if custom domain needed
- [ ] If yes, configured on Render
- [ ] If yes, configured on Vercel
- [ ] DNS updated if applicable

### Backups (Optional)
- [ ] Understood free tier database limitations
- [ ] Decided on backup strategy (if needed)
- [ ] Exported database (if needed)

### Scaling (Optional)
- [ ] Monitored resource usage
- [ ] Noted if free tier is sufficient
- [ ] Planned upgrade path (if needed)

---

## Final Checklist

### Before Celebrating 🎉
- [ ] All sections above complete
- [ ] App is accessible publicly
- [ ] End-to-end testing passed
- [ ] No errors in logs
- [ ] Documented all URLs and access info
- [ ] Shared with others/demonstrated

### Post-Launch
- [ ] Monitor logs for first 24 hours
- [ ] Test regularly throughout the week
- [ ] Note any issues or improvements needed
- [ ] Plan next features or optimizations
- [ ] Consider upgrading from free tier if needed

---

## Notes & Issues

Use this section to track any issues encountered:

```
Issue #1: [Description]
- Status: [Resolved / In Progress / Blocked]
- Steps: [How you fixed it]

Issue #2: [Description]
- Status: [Resolved / In Progress / Blocked]
- Steps: [How you fixed it]
```

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Docker Docs**: https://docs.docker.com
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Vite Docs**: https://vitejs.dev

## Getting Help

1. Check the appropriate documentation:
   - New to Docker? → `docs/docker-quick-start.md`
   - Deployment questions? → `docs/deployment.md`
   - Environment variables? → `docs/environment-variables.md`

2. Check error messages:
   - Browser console (DevTools → Console)
   - Render logs (Dashboard → Logs)
   - Vercel logs (Deployments → View Logs)

3. Common issues:
   - See `docs/deployment.md` → Troubleshooting section

---

**Status**: [ ] In Progress  [ ] Complete  [ ] Deployed to Production

**Deployment Date**: _______________

**Deployed By**: _______________

**Notes**: 
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

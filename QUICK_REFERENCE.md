# 🚀 Deployment Quick Reference

## Live URLs

| Service | URL |
|---------|-----|
| **Frontend (App)** | https://inventory-order-management-system-navy-eta.vercel.app |
| **Backend (API)** | https://inventory-order-api-5wob.onrender.com |
| **API Docs (Swagger)** | https://inventory-order-api-5wob.onrender.com/docs |
| **API Docs (ReDoc)** | https://inventory-order-api-5wob.onrender.com/redoc |
| **Health Check** | https://inventory-order-api-5wob.onrender.com/health |

## Quick Testing

### From Terminal
```bash
# Test backend health
curl https://inventory-order-api-5wob.onrender.com/health

# Get all products
curl https://inventory-order-api-5wob.onrender.com/api/v1/products/

# Get all customers
curl https://inventory-order-api-5wob.onrender.com/api/v1/customers/

# Get all orders
curl https://inventory-order-api-5wob.onrender.com/api/v1/orders/
```

### From Browser
```javascript
// Open browser console and run:
fetch('https://inventory-order-api-5wob.onrender.com/api/v1/products/')
  .then(r => r.json())
  .then(d => console.log(d))
```

## Deployment Info

- **Frontend Platform**: Vercel
- **Backend Platform**: Render
- **Frontend Framework**: React 19 + Vite 8
- **Backend Framework**: FastAPI + PostgreSQL
- **Cost**: $0/month (free tier)
- **Deployment Date**: June 20, 2026

## Key Features

✅ Dashboard with real-time stats  
✅ Product management (CRUD)  
✅ Customer management (CRUD)  
✅ Order management (CRUD)  
✅ Stock tracking & alerts  
✅ Responsive design  
✅ API documentation  
✅ Auto-deployment on git push  

## Dashboards

### Render Dashboard
- URL: https://dashboard.render.com
- Service: `inventory-order-api`
- View logs, restart service, manage environment variables

### Vercel Dashboard
- URL: https://vercel.com/dashboard
- Project: `inventory-order-management-system`
- View deployments, manage environment variables, view logs

## Making Changes

```bash
# Make code changes
git add .
git commit -m "Your changes"
git push origin main

# Auto-deployment:
# - Render rebuilds & deploys backend (2-5 min)
# - Vercel rebuilds & deploys frontend (1-3 min)
```

## Monitoring

### Check Backend Status
```bash
curl https://inventory-order-api-5wob.onrender.com/health
```

### Check Frontend
- Visit: https://inventory-order-management-system-navy-eta.vercel.app
- Open DevTools (F12) → Console
- Check for any error messages

### View Logs
- **Render**: https://dashboard.render.com → Select service → Logs
- **Vercel**: https://vercel.com/dashboard → Select project → Deployments

## Performance Notes

### First Request Latency
- Backend (first request): ~30 seconds (free tier cold start)
- Backend (subsequent): <200ms
- Frontend: <1 second (globally cached)

## Environment Configuration

### Backend (Render)
```
DATABASE_URL=postgresql://[auto-provided by Render]
CORS_ORIGINS=https://inventory-order-management-system-navy-eta.vercel.app
ENVIRONMENT=production
```

### Frontend (Vercel)
```
VITE_API_URL=https://inventory-order-api-5wob.onrender.com/api/v1
```
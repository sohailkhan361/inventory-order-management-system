# Containers and free-tier deployment

The backend and frontend are independent deployable applications:

```text
Browser -> Vercel (React static files) -> Render (FastAPI container) -> PostgreSQL
```

## What Docker does here

A Docker image packages an application, its runtime, and its dependencies. A container is a running instance of that image.

- `backend/Dockerfile` packages Python, the FastAPI application, and Uvicorn.
- `frontend/Dockerfile` builds the Vite application and serves the static output with unprivileged Nginx.
- Render can build and run the backend Dockerfile.
- Vercel does **not** run Docker containers. It builds the frontend natively from `frontend/`; the frontend Dockerfile remains useful for local testing or another container host.

## Run each container locally

### Backend

The backend needs a reachable PostgreSQL database:

```bash
docker build -t inventory-order-backend ./backend
docker run --rm -p 8000:8000 \
  -e DATABASE_URL=postgresql://USER:PASSWORD@DATABASE_HOST:5432/inventory_db \
  -e CORS_ORIGINS=http://127.0.0.1:8080 \
  inventory-order-backend
```

Verify `http://127.0.0.1:8000/health`. Inside a container, `localhost` means that container—not your computer or another container. On Docker Desktop, use `host.docker.internal` to reach a PostgreSQL server exposed by the host.

### Frontend

Vite variables are compiled into the static JavaScript bundle, so pass the API URL while building the image:

```bash
docker build \
  --build-arg VITE_API_URL=http://127.0.0.1:8000/api/v1 \
  -t inventory-order-frontend ./frontend

docker run --rm -p 8080:8080 inventory-order-frontend
```

Open `http://127.0.0.1:8080`. Rebuild the image whenever `VITE_API_URL` changes.

## Deploy the backend and database to Render

The repository-level `render.yaml` is a Render Blueprint. It creates:

- a free Docker web service from `backend/Dockerfile`;
- a free PostgreSQL database in the same region;
- a private `DATABASE_URL` connection between them;
- an HTTP health check at `/health`.

Steps:

1. Push this repository to GitHub or GitLab.
2. Sign in to Render and choose **New > Blueprint**.
3. Connect the repository. Render detects `render.yaml` at the repository root.
4. When asked for `CORS_ORIGINS`, enter `*` for the first deployment. Tighten it after Vercel gives you a URL.
5. Apply the Blueprint and wait for both the database and `inventory-order-api` to become available.
6. Open `https://YOUR-RENDER-SERVICE.onrender.com/health`. A successful response is `{"status":"ok","version":"1.0.0"}`.
7. Save the backend base URL. The frontend value will be `https://YOUR-RENDER-SERVICE.onrender.com/api/v1`.

The container binds to Render's dynamic `PORT` on `0.0.0.0`. The application creates missing tables during startup because the repository still has no committed Alembic migration revision.

### Important free Render limitations

Render's free web service can spin down while idle, so the first request after inactivity may be slow. As of June 2026, free Render PostgreSQL is limited to 1 GB, expires after 30 days, and has no backups. Treat it as temporary demo storage, not durable production data.

## Deploy the frontend to Vercel

1. Sign in to Vercel and choose **Add New > Project**.
2. Import the same Git repository.
3. Set **Root Directory** to `frontend`.
4. Vercel should detect **Vite**. Keep these values:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm ci` (the default `npm install` also works)
5. Add this environment variable for Production and Preview:

   ```text
   VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/v1
   ```

6. Deploy. `frontend/vercel.json` sends client-side routes such as `/products` back to `index.html`, allowing React Router deep links to work.
7. Test the Vercel dashboard and create a product/customer.

Vite reads `VITE_API_URL` during the build. If you edit it in Vercel, redeploy the frontend; changing it does not modify an already-built deployment.

## Lock down CORS after Vercel deploys

Return to the Render service's **Environment** settings and replace `CORS_ORIGINS=*` with the exact Vercel origin:

```text
CORS_ORIGINS=https://YOUR-PROJECT.vercel.app
```

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

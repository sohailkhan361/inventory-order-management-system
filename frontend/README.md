# Frontend

React 19 single-page dashboard built with Vite 8, Tailwind CSS 4, React Router, Axios, React Hook Form, Toastify, and Lucide icons.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8)
- npm
- The backend API running and reachable from the browser

## Configure and run

From `frontend/`:

```bash
npm ci
cp .env.example .env
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:5173.

`VITE_API_URL` controls the API base URL:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

If `.env` is omitted, the code defaults to `http://localhost:8000/api/v1`. Restart Vite after changing an environment variable. Only variables prefixed with `VITE_` are exposed to client code; never put secrets in them.

## Commands

```bash
npm run dev      # development server with hot reload
npm run lint     # ESLint checks
npm run build    # production bundle in dist/
npm run preview  # serve the production bundle locally
```

Lint and production build were verified successfully on 2026-06-20.

## Structure

```text
src/components/  modal and display primitives
src/hooks/       reusable request state hook
src/layouts/     navigation and page shell
src/pages/       dashboard, products, customers, orders
src/services/    Axios instance and API methods
src/App.jsx      client routes and toast container
```

## Backend contract

The dashboard calls these paginated endpoints:

- `GET /products/`
- `GET /customers/`
- `GET /orders/`

Order line items are returned in the `order_items` field. The configured URL must include the backend `/api/v1` prefix.

## Troubleshooting

- Network error: verify `curl http://127.0.0.1:8000/health`, the configured API URL, and that the backend is running.
- CORS error: add the frontend origin to the backend CORS configuration. The current development configuration allows all origins.
- Blank/old configuration: stop and restart Vite after editing `.env`.
- `npm ci` failure: use a supported Node.js version and keep `package-lock.json` in sync with `package.json`.

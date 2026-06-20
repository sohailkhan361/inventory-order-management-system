# React Frontend — Inventory & Order Management System

A modern Single Page Application (SPA) dashboard built using React, Vite, and Tailwind CSS v4.0, integrating with the FastAPI backend.

---

## ⚡ Tech Stack

- **Runtime & Bundler**: [Vite](https://vite.dev/) (lightning-fast development and optimized production asset compilation)
- **Framework**: [React 19](https://react.dev/) (modern state management and declarative component rendering)
- **Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/) (zero-config Vite plugin compilation, CSS-based variable themes)
- **Routing**: [React Router v7](https://reactrouter.com/) (dynamic routing framework)
- **Forms**: [React Hook Form](https://react-hook-form.com/) (performant, flexible form validation)
- **Alerts**: [React Toastify](https://fkhadra.github.io/react-toastify/) (customizable dark-themed growl notifications)
- **Icons**: [Lucide React](https://lucide.dev/) (consistent, high-quality outline icon set)
- **Network**: [Axios](https://axios-http.com/) (HTTP request middleware with integrated global interceptors)

---

## 🏛️ Code Structure

```
frontend/
├── src/
│   ├── components/       # Reusable primitives (StatCard, Spinner, Badge, Modal, ConfirmModal)
│   ├── hooks/            # Custom React hooks (useFetch hook for consistent load handling)
│   ├── layouts/          # Page layouts (collapsible AppLayout sidebar frame)
│   ├── pages/            # View Pages (Dashboard, Products, Customers, Orders)
│   ├── services/         # API connection handlers (Axios api setup & service layers)
│   ├── App.jsx           # Routing configuration & global toast overlays
│   ├── index.css         # Tailwind v4 directives & scroll overrides
│   └── main.jsx          # React app entry bootstrap
├── package.json          # Node dependency configurations
└── vite.config.js        # Vite compilation & tailwind plugin configurations
```

---

## 🚀 Dev Setup

For step-by-step installation instructions, see the [🚀 Project Setup Guide](file:///Users/sohailkhan/Documents/POC/inventory-order-management-system/docs/installation.md). Here is a quick run guide:

### 1. Install Node Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended):
```bash
npm install
```

### 2. Configure API Endpoint
By default, the frontend requests `http://localhost:8000/api/v1` for backend APIs. To modify this, you can set the `VITE_API_URL` environment variable:
```bash
# Create local env settings
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
```

### 3. Spin Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 4. Build Production Assets
```bash
npm run build
```
Compiled output will be placed in the `dist/` directory.

---

## 🏛️ Design System

We employ a minimalist, high-contrast dark dashboard theme modeled on modern developer platforms (Linear, Stripe, Vercel). Color configurations are declared as native CSS variables within the `@theme` rule inside `src/index.css`, allowing utility class compiler integration:
- Base Background: `#09090b` (zinc-950)
- Secondary Surface: `#121214` (zinc-900)
- Border Accents: `#27272a` (zinc-800)
- Main Font: Inter

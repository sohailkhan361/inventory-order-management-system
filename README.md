# Inventory & Order Management System

A high-performance full-stack web application for real-time inventory tracking, customer accounts registration, and client order checkouts. This repository contains a production-ready **FastAPI Backend** and a premium, dark-mode **Vite React Frontend** styled with Tailwind CSS v4.0.

---

## 📖 Documentation Index

For deep-dive setup guides, architectural decisions, and API blueprints, refer to:

- [🚀 Installation Guide](file:///Users/sohailkhan/Documents/POC/inventory-order-management-system/docs/installation.md) — Step-by-step setup checklist for backend services, PostgreSQL database schema, and frontend packages.
- [🏛️ Architecture & Tech Stack Choices](file:///Users/sohailkhan/Documents/POC/inventory-order-management-system/docs/architecture.md) — Database design (Mermaid ER diagram), layered service architecture, locking models, and stack trade-offs.
- [🔌 API Specification](file:///Users/sohailkhan/Documents/POC/inventory-order-management-system/docs/api.md) — Blueprints for Products, Customers, and Orders REST resources, parameters, and payload schemas.

Or navigate straight to sub-project READMEs:
- [🐍 Backend Layer README](file:///Users/sohailkhan/Documents/POC/inventory-order-management-system/backend/README.md)
- [⚡ Frontend Layer README](file:///Users/sohailkhan/Documents/POC/inventory-order-management-system/frontend/README.md)

---

## 🛠️ Repository Directory Mapping

```
inventory-order-management-system/
├── backend/                  # FastAPI + SQLAlchemy Backend service
│   ├── app/                  # Application code (routers, services, models, schemas)
│   ├── alembic/              # Database migration logs & scripts
│   └── requirements.txt      # Python dependencies manifest
├── frontend/                 # Vite + React + Tailwind v4.0 SPA Frontend
│   ├── src/
│   │   ├── components/       # Shared modal dialogs & UI primitives
│   │   ├── layouts/          # Responsive App shell Layouts
│   │   ├── pages/            # View Pages (Dashboard, Products, Customers, Orders)
│   │   └── services/         # Axios api request wrappers
│   └── package.json          # Node package requirements
└── docs/                     # Deep-dive system documentation markdown sheets
```

---

## ⚡ Key Highlights

### Layered Database CRUD
The backend is structured into Routers (controllers), Services (business rules), Models (SQLAlchemy entities), and Schemas (Pydantic payload models), ensuring clean concerns isolation.

### Stock Availability Safeguards
Uses database row-level locking (`SELECT FOR UPDATE`) on product records when checkout orders are compiled, eliminating inventory overselling or double-booking race conditions during concurrent checkouts.

### Snapshot Product Prices
Saves the unit price of items *at the exact moment* of order checkout inside the `OrderItem` table, protecting historical invoice records from future inventory price updates.

### Tailwind CSS v4.0 UI Redesign
A sleek, high-contrast dark dashboard inspired by Linear and Stripe, incorporating responsive navigation panels, backdrop-blurred modal overlays, and real-time form validation.

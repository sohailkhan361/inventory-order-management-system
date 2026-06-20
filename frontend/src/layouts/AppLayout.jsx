import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  Menu, X, Boxes,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/products',  icon: Package,         label: 'Products'   },
  { to: '/customers', icon: Users,           label: 'Customers'  },
  { to: '/orders',    icon: ShoppingCart,    label: 'Orders'     },
];

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/products':  'Products',
  '/customers': 'Customers',
  '/orders':    'Orders',
};

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Inventory System';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Boxes size={18} color="#fff" />
          </div>
          <div className="sidebar-logo-text">
            Inventory
            <span>Order Management</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Icon size={17} className="nav-icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          fontSize: '.75rem',
          color: 'var(--text-muted)',
        }}>
          v1.0.0 &middot; Inventory System
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              id="sidebar-toggle"
              className="hamburger"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-title">{title}</span>
          </div>
          <div className="topbar-right">
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.8rem', fontWeight: 700, color: '#fff',
            }}>
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}

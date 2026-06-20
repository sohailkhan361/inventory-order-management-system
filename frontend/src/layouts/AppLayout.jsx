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
    <div className="min-h-screen flex bg-[#09090b] font-sans text-zinc-100 antialiased">
      {/* Sidebar Overlay (Mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-55 w-60 bg-[#09090b] border-r border-zinc-900/80
        flex flex-col transform transition-transform duration-200 ease-in-out
        md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="h-14 border-b border-zinc-900/80 flex items-center gap-2.5 px-5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Boxes size={16} className="text-zinc-100" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-zinc-100 tracking-tight leading-none">Inventory</span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-tight mt-0.5">Order Management</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-3 mb-2.5">
            Main Menu
          </div>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors select-none
                ${isActive 
                  ? 'bg-zinc-900 text-zinc-100 border-l-2 border-zinc-400 pl-2.5' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'}
              `}
              onClick={closeSidebar}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-900/80 text-[10px] text-zinc-650 flex items-center justify-between">
          <span>v1.0.0 &middot; SaaS UI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-60 min-h-screen">
        {/* Sticky Topbar */}
        <header className="sticky top-0 z-30 h-14 bg-[#09090b]/85 backdrop-blur-md border-b border-zinc-900/80 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-zinc-400 hover:text-zinc-200 transition-colors p-1.5 -ml-1 rounded-lg hover:bg-zinc-900"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-700 flex items-center justify-center shadow-inner">
              <span className="text-[11px] font-bold text-zinc-200">A</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

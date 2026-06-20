import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { productService, customerService, orderService } from '../services';
import { StatCard, Spinner, Badge } from '../components/UI';

export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [orders, setOrders]     = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getAll({ limit: 500 }),
      customerService.getAll({ limit: 500 }),
      orderService.getAll({ limit: 5 }),
    ]).then(([pRes, cRes, oRes]) => {
      const products  = pRes.data.items  || [];
      const customers = cRes.data.items  || [];
      const orders    = oRes.data.items  || [];

      setStats({
        products:  pRes.data.total  || 0,
        customers: cRes.data.total  || 0,
        orders:    oRes.data.total  || 0,
      });
      setOrders(orders);
      setLowStock(products.filter((p) => p.quantity_in_stock <= 5).slice(0, 6));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-xs text-zinc-400 mt-1">Real-time stats and alerts for your inventory items.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats?.products}
          icon={<Package size={16} />}
          accentColor="#3b82f6"
        />
        <StatCard
          label="Total Customers"
          value={stats?.customers}
          icon={<Users size={16} />}
          accentColor="#10b981"
        />
        <StatCard
          label="Total Orders"
          value={stats?.orders}
          icon={<ShoppingCart size={16} />}
          accentColor="#8b5cf6"
        />
        <StatCard
          label="Low Stock Items"
          value={lowStock.length}
          icon={<AlertTriangle size={16} />}
          accentColor="#f59e0b"
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Card */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5 font-medium">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-zinc-650">
              <TrendingUp size={28} className="opacity-40 mb-2" />
              <p className="text-xs">No orders placed yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-900">
                    <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Order #</th>
                    <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Customer</th>
                    <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Total</th>
                    <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-900/25 transition-colors">
                      <td className="px-5 py-3.5">
                        <Badge variant="blue">#{o.id}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-300 font-medium">{o.customer?.full_name || '—'}</td>
                      <td className="px-5 py-3.5 text-white font-semibold">${Number(o.total_amount).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-zinc-550 text-xs">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts Card */}
        <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">⚠️ Low Stock Alerts</h3>
            <Link to="/products" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5 font-medium">
              View catalog <ArrowRight size={12} />
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-zinc-650">
              <Package size={28} className="opacity-40 mb-2" />
              <p className="text-xs">All items are well stocked</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-zinc-950/40 border-b border-zinc-900">
                    <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Product</th>
                    <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">SKU</th>
                    <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {lowStock.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/25 transition-colors">
                      <td className="px-5 py-3.5 text-zinc-300 font-semibold">{p.name}</td>
                      <td className="px-5 py-3.5 text-zinc-550 font-mono text-xs">{p.sku}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.quantity_in_stock === 0 ? 'red' : 'yellow'}>
                          {p.quantity_in_stock} remaining
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

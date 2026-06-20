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
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back — here's what's happening today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Products"
          value={stats?.products}
          icon={<Package size={20} />}
          accentColor="var(--accent)"
          accentDim="var(--accent-dim)"
        />
        <StatCard
          label="Total Customers"
          value={stats?.customers}
          icon={<Users size={20} />}
          accentColor="var(--green)"
          accentDim="var(--green-dim)"
        />
        <StatCard
          label="Total Orders"
          value={stats?.orders}
          icon={<ShoppingCart size={20} />}
          accentColor="var(--purple)"
          accentDim="var(--purple-dim)"
        />
        <StatCard
          label="Low Stock Items"
          value={lowStock.length}
          icon={<AlertTriangle size={20} />}
          accentColor="var(--yellow)"
          accentDim="var(--yellow-dim)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <Link to="/orders" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <TrendingUp size={32} />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Badge variant="blue">#{o.id}</Badge>
                      </td>
                      <td className="td-muted">{o.customer?.full_name || '—'}</td>
                      <td style={{ fontWeight: 600 }}>${Number(o.total_amount).toFixed(2)}</td>
                      <td className="td-muted">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="card">
          <div className="card-header">
            <h2>⚠ Low Stock Alert</h2>
            <Link to="/products" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <Package size={32} />
              <p>All products are well stocked</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id} className="low-stock-row">
                      <td>{p.name}</td>
                      <td className="td-muted">{p.sku}</td>
                      <td>
                        <Badge variant={p.quantity_in_stock === 0 ? 'red' : 'yellow'}>
                          {p.quantity_in_stock}
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

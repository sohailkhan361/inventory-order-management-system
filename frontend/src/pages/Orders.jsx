import { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Eye, Trash2, ShoppingCart, Calendar, User, DollarSign, PlusCircle, MinusCircle, Info } from 'lucide-react';
import { orderService, customerService, productService } from '../services';
import { useFetch } from '../hooks/useFetch';
import { Spinner, EmptyState, Badge } from '../components/UI';
import { Modal, ConfirmModal } from '../components/Modal';

export default function Orders() {
  const { data, loading, error, refetch } = useFetch(() => orderService.getAll({ limit: 100 }));
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for creating order
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [lineItems, setLineItems] = useState([{ product_id: '', quantity: 1 }]);

  // Fetch data required for new order creation
  const handleOpenCreateModal = async () => {
    setActionLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productService.getAll({ limit: 500 }),
        customerService.getAll({ limit: 500 }),
      ]);
      setProducts(pRes.data.items || []);
      setCustomers(cRes.data.items || []);
      
      // Reset form states
      setCustomerId('');
      setLineItems([{ product_id: '', quantity: 1 }]);
      setIsCreateOpen(true);
    } catch (err) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Line item manipulation
  const handleAddLineItem = () => {
    setLineItems([...lineItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  // Fetch full details of specific order
  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    setSelectedOrderLoading(true);
    try {
      const res = await orderService.getById(order.id);
      setSelectedOrder(res.data);
    } catch (err) {
      toast.error('Failed to load order details: ' + err.message);
    } finally {
      setSelectedOrderLoading(false);
    }
  };

  // Submit handlers
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (lineItems.some((item) => !item.product_id)) {
      toast.error('Please select a product for all items');
      return;
    }

    // Validate quantities and stock levels
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      const product = products.find((p) => p.id === parseInt(item.product_id, 10));
      const qty = parseInt(item.quantity, 10);

      if (isNaN(qty) || qty <= 0) {
        toast.error(`Please specify a valid quantity for item ${i + 1}`);
        return;
      }

      if (!product) {
        toast.error(`Product not found for item ${i + 1}`);
        return;
      }

      if (qty > product.quantity_in_stock) {
        toast.error(`Insufficient stock for "${product.name}". Available: ${product.quantity_in_stock}`);
        return;
      }
    }

    setActionLoading(true);
    try {
      await orderService.create({
        customer_id: parseInt(customerId, 10),
        items: lineItems.map((item) => ({
          product_id: parseInt(item.product_id, 10),
          quantity: parseInt(item.quantity, 10),
        })),
      });
      toast.success('Order placed successfully');
      setIsCreateOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    setActionLoading(true);
    try {
      await orderService.delete(cancellingOrder.id);
      toast.success('Order cancelled successfully (Stock restored)');
      setCancellingOrder(null);
      setIsDetailsOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations for display in Create Order
  const calculateTotal = () => {
    return lineItems.reduce((acc, item) => {
      if (!item.product_id) return acc;
      const product = products.find((p) => p.id === parseInt(item.product_id, 10));
      const price = product ? Number(product.price) : 0;
      const quantity = parseInt(item.quantity, 10) || 0;
      return acc + price * quantity;
    }, 0);
  };

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  const orders = data?.items || [];

  // Filter orders based on customer name search term
  const filteredOrders = orders.filter((o) =>
    o.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toString().includes(searchTerm)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Create new client orders and manage previous transactions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal} disabled={actionLoading}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="search-bar">
            <ShoppingCart size={16} />
            <input
              type="text"
              placeholder="Search by customer name or Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={48} />}
            title="No orders found"
            description={searchTerm ? "Try adjusting your search query." : "Start by creating a new order."}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Date Placed</th>
                  <th>Items Count</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Badge variant="blue">#{o.id}</Badge>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.customer?.full_name || '—'}</td>
                    <td style={{ fontWeight: 600 }}>${Number(o.total_amount).toFixed(2)}</td>
                    <td className="td-muted">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} />
                        <span>{new Date(o.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="td-muted">{o.items?.length || 0} line items</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => handleViewDetails(o)}
                          title="View Details"
                          aria-label={`View order ${o.id} details`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => setCancellingOrder(o)}
                          title="Cancel Order"
                          aria-label={`Cancel order ${o.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {isCreateOpen && (
        <Modal title="Create New Order" onClose={() => setIsCreateOpen(false)} size="modal-lg">
          <form onSubmit={handleCreateOrder}>
            <div className="form-group">
              <label className="form-label">Select Customer</label>
              <select
                className="form-input"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ margin: '20px 0 10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Order Line Items</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddLineItem}>
                <PlusCircle size={14} /> Add Item Row
              </button>
            </div>

            {/* Line Items Grid */}
            <div style={{ maxHeight: 250, overflowY: 'auto', paddingRight: 4, marginBottom: 20 }}>
              {lineItems.map((item, index) => {
                const selectedProd = products.find((p) => p.id === parseInt(item.product_id, 10));
                const maxStock = selectedProd ? selectedProd.quantity_in_stock : 0;
                
                return (
                  <div key={index} className="order-item-row">
                    <div className="form-group" style={{ margin: 0 }}>
                      {index === 0 && <label className="form-label">Product</label>}
                      <select
                        className="form-input"
                        value={item.product_id}
                        onChange={(e) => handleLineItemChange(index, 'product_id', e.target.value)}
                        required
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${Number(p.price).toFixed(2)}) [Stock: {p.quantity_in_stock}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0, width: 90 }}>
                      {index === 0 && <label className="form-label">Qty</label>}
                      <input
                        type="number"
                        className="form-input"
                        min="1"
                        max={maxStock || undefined}
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', height: 38, gap: 10 }}>
                      <span style={{ fontSize: '.88rem', fontWeight: 600, width: 80, textAlign: 'right' }}>
                        ${selectedProd ? (Number(selectedProd.price) * (parseInt(item.quantity, 10) || 0)).toFixed(2) : '0.00'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => handleRemoveLineItem(index)}
                        disabled={lineItems.length === 1}
                        style={{ color: 'var(--red)' }}
                        aria-label="Remove item"
                      >
                        <MinusCircle size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="total-row">
              <span>Grand Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Order Details Modal */}
      {isDetailsOpen && selectedOrder && (
        <Modal title={`Order Details: #${selectedOrder.id}`} onClose={() => setIsDetailsOpen(false)} size="modal-lg">
          {selectedOrderLoading ? (
            <Spinner />
          ) : (
            <div>
              <div className="order-meta">
                <div className="order-meta-item">
                  <label>Customer Name</label>
                  <p>{selectedOrder.customer?.full_name}</p>
                </div>
                <div className="order-meta-item">
                  <label>Email Address</label>
                  <p>{selectedOrder.customer?.email}</p>
                </div>
                <div className="order-meta-item">
                  <label>Order Date</label>
                  <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div className="order-meta-item">
                  <label>Contact Phone</label>
                  <p>{selectedOrder.customer?.phone_number || '—'}</p>
                </div>
              </div>

              <div style={{ marginTop: 24, marginBottom: 16 }}>
                <h3 style={{ fontSize: '.95rem', fontWeight: 600, marginBottom: 12 }}>Items in this Order</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product SKU</th>
                        <th>Product Name</th>
                        <th>Quantity Ordered</th>
                        <th>Unit Price</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="td-muted">{item.product?.sku || '—'}</td>
                          <td style={{ fontWeight: 500 }}>{item.product?.name || '—'}</td>
                          <td>{item.quantity}</td>
                          <td>${Number(item.unit_price).toFixed(2)}</td>
                          <td style={{ fontWeight: 600, textAlign: 'right' }}>
                            ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="total-row">
                <span>Total Amount Charged:</span>
                <span>${Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>

              <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setCancellingOrder(selectedOrder)}
                >
                  Cancel Order
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete/Cancel Order Confirmation Modal */}
      {cancellingOrder && (
        <ConfirmModal
          title="Cancel Order"
          message={`Are you sure you want to cancel Order #${cancellingOrder.id}? This will reverse the stock deduction and delete this order record.`}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancellingOrder(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

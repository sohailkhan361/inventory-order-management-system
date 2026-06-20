import { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Eye, Trash2, ShoppingCart, Calendar, PlusCircle, MinusCircle } from 'lucide-react';
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
  if (error) return <div className="text-rose-455 text-xs py-10 text-center">Error: {error}</div>;

  const orders = data?.items || [];

  // Filter orders based on customer name search term
  const filteredOrders = orders.filter((o) =>
    o.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Orders</h2>
          <p className="text-xs text-zinc-400 mt-1">Compile client checkouts, view historical records, and cancel orders.</p>
        </div>
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors select-none self-start sm:self-auto"
          onClick={handleOpenCreateModal} 
          disabled={actionLoading}
        >
          <Plus size={14} /> Create Order
        </button>
      </div>

      <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-zinc-900 bg-zinc-950/20">
          <div className="relative w-full max-w-xs">
            <ShoppingCart size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              className="w-full bg-[#09090b] border border-zinc-800 text-zinc-100 rounded-lg py-1.5 pl-9 pr-3 text-xs placeholder:text-zinc-550 outline-none focus:border-zinc-700 transition-colors"
              placeholder="Search by customer or Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-zinc-500 font-medium select-none">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={36} />}
            title="No orders placed"
            description={searchTerm ? "Try adjusting your search query." : "Start by creating a new customer order."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-zinc-950/40 border-b border-zinc-900">
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Order #</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Customer</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Total Amount</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Date Placed</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Items Count</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-right uppercase px-5 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-900/25 transition-colors">
                    <td className="px-5 py-3.5">
                      <Badge variant="blue">#{o.id}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-300 font-semibold">{o.customer?.full_name || '—'}</td>
                    <td className="px-5 py-3.5 text-white font-semibold">${Number(o.total_amount).toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-zinc-400">
                      <div className="flex items-center gap-1.5 text-zinc-450">
                        <Calendar size={13} className="text-zinc-550" />
                        <span>{new Date(o.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-450 text-xs font-medium">{o.order_items?.length || 0} line items</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1.5">
                        <button
                          className="p-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-all"
                          onClick={() => handleViewDetails(o)}
                          aria-label={`View order ${o.id} details`}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="p-1.5 border border-zinc-800 text-rose-500/80 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all"
                          onClick={() => setCancellingOrder(o)}
                          aria-label={`Cancel order ${o.id}`}
                        >
                          <Trash2 size={13} />
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
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Select Customer</label>
              <select
                className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="" className="bg-zinc-950">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-950">
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 pt-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Order Line Items</h3>
              <button 
                type="button" 
                className="flex items-center gap-1 px-2.5 py-1 border border-zinc-850 text-zinc-350 hover:bg-zinc-900 text-[11px] font-semibold rounded-md transition-colors"
                onClick={handleAddLineItem}
              >
                <PlusCircle size={12} /> Add Item Row
              </button>
            </div>

            {/* Line Items List */}
            <div className="max-h-60 overflow-y-auto pr-1 space-y-3.5">
              {lineItems.map((item, index) => {
                const selectedProd = products.find((p) => p.id === parseInt(item.product_id, 10));
                const maxStock = selectedProd ? selectedProd.quantity_in_stock : 0;
                
                return (
                  <div key={index} className="grid grid-cols-[1fr_80px_auto] gap-3 items-end">
                    <div className="space-y-1">
                      {index === 0 && <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Product</label>}
                      <select
                        className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 transition-colors cursor-pointer"
                        value={item.product_id}
                        onChange={(e) => handleLineItemChange(index, 'product_id', e.target.value)}
                        required
                      >
                        <option value="" className="bg-zinc-950">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} className="bg-zinc-950">
                            {p.name} (${Number(p.price).toFixed(2)}) [Stock: {p.quantity_in_stock}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      {index === 0 && <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Qty</label>}
                      <input
                        type="number"
                        className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 transition-colors"
                        min="1"
                        max={maxStock || undefined}
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 h-9 pl-1">
                      <span className="text-xs font-semibold text-zinc-200 w-16 text-right select-none">
                        ${selectedProd ? (Number(selectedProd.price) * (parseInt(item.quantity, 10) || 0)).toFixed(2) : '0.00'}
                      </span>
                      <button
                        type="button"
                        className="p-1.5 border border-zinc-850 hover:bg-zinc-900 rounded-lg text-rose-500 hover:text-rose-400 transition-colors"
                        onClick={() => handleRemoveLineItem(index)}
                        disabled={lineItems.length === 1}
                        aria-label="Remove item"
                      >
                        <MinusCircle size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end items-center gap-4 py-3.5 border-t border-zinc-900 text-sm font-semibold text-white">
              <span>Grand Total:</span>
              <span className="text-base font-bold">${calculateTotal().toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-850 mt-5">
              <button 
                type="button" 
                className="px-3.5 py-1.5 border border-zinc-800 text-zinc-350 hover:bg-zinc-900 hover:text-white text-xs font-medium rounded-lg transition-colors" 
                onClick={() => setIsCreateOpen(false)} 
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-3.5 py-1.5 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold rounded-lg transition-colors" 
                disabled={actionLoading}
              >
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
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/35 border border-zinc-900/80 p-3.5 rounded-xl">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Customer Name</label>
                  <p className="text-xs font-semibold text-zinc-200 mt-1">{selectedOrder.customer?.full_name}</p>
                </div>
                <div className="bg-zinc-900/35 border border-zinc-900/80 p-3.5 rounded-xl">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</label>
                  <p className="text-xs font-semibold text-zinc-200 mt-1">{selectedOrder.customer?.email}</p>
                </div>
                <div className="bg-zinc-900/35 border border-zinc-900/80 p-3.5 rounded-xl">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Order Date</label>
                  <p className="text-xs font-semibold text-zinc-200 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div className="bg-zinc-900/35 border border-zinc-900/80 p-3.5 rounded-xl">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Contact Phone</label>
                  <p className="text-xs font-semibold text-zinc-200 mt-1">{selectedOrder.customer?.phone_number || '—'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-zinc-450 uppercase tracking-wider mb-2.5">Items in this Order</h3>
                <div className="overflow-x-auto border border-zinc-900 rounded-xl">
                  <table className="w-full text-[13px] border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/40 border-b border-zinc-900">
                        <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2">Product SKU</th>
                        <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2">Product Name</th>
                        <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2">Quantity</th>
                        <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2">Unit Price</th>
                        <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-right uppercase px-5 py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {selectedOrder.order_items?.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-900/25 transition-colors">
                          <td className="px-5 py-3 text-zinc-500 font-mono text-xs">{item.product?.sku || '—'}</td>
                          <td className="px-5 py-3 text-zinc-300 font-semibold">{item.product?.name || '—'}</td>
                          <td className="px-5 py-3 text-zinc-350">{item.quantity}</td>
                          <td className="px-5 py-3 text-zinc-350">${Number(item.unit_price).toFixed(2)}</td>
                          <td className="px-5 py-3 text-right text-white font-semibold">
                            ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end items-center gap-4 py-3.5 border-t border-zinc-900 text-sm font-semibold text-white">
                <span>Total Amount Charged:</span>
                <span className="text-base font-bold">${Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-850 mt-5">
                <button
                  type="button"
                  className="px-3.5 py-1.5 bg-red-950/40 border border-red-900/30 text-xs font-semibold text-red-400 hover:bg-red-900/40 hover:text-red-300 rounded-lg transition-colors"
                  onClick={() => setCancellingOrder(selectedOrder)}
                >
                  Cancel Order
                </button>
                <button 
                  type="button" 
                  className="px-3.5 py-1.5 border border-zinc-800 text-zinc-350 hover:bg-zinc-900 hover:text-white text-xs font-medium rounded-lg transition-colors" 
                  onClick={() => setIsDetailsOpen(false)}
                >
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

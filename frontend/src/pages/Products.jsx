import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { productService } from '../services';
import { useFetch } from '../hooks/useFetch';
import { Spinner, EmptyState, Badge } from '../components/UI';
import { Modal, ConfirmModal } from '../components/Modal';

export default function Products() {
  const { data, loading, error, refetch } = useFetch(() => productService.getAll({ limit: 200 }));
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // React Hook Form for Add/Edit
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      price: '',
      quantity_in_stock: '',
    }
  });

  const openAddModal = () => {
    reset({
      name: '',
      sku: '',
      price: '',
      quantity_in_stock: 0,
    });
    setIsAddOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('sku', product.sku);
    setValue('price', product.price);
    setValue('quantity_in_stock', product.quantity_in_stock);
  };

  // Submit handlers
  const onAddSubmit = async (formData) => {
    setActionLoading(true);
    try {
      await productService.create({
        ...formData,
        price: parseFloat(formData.price),
        quantity_in_stock: parseInt(formData.quantity_in_stock, 10),
      });
      toast.success('Product created successfully');
      setIsAddOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setActionLoading(false);
    }
  };

  const onEditSubmit = async (formData) => {
    setActionLoading(true);
    try {
      await productService.update(editingProduct.id, {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity_in_stock: parseInt(formData.quantity_in_stock, 10),
      });
      toast.success('Product updated successfully');
      setEditingProduct(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setActionLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await productService.delete(deletingProduct.id);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product. Ensure it is not in any orders.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-rose-400 text-xs py-10 text-center">Error: {error}</div>;

  const products = data?.items || [];
  
  // Filter products based on search term
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Products</h2>
          <p className="text-xs text-zinc-400 mt-1">Manage your inventory items, pricing, and stock levels.</p>
        </div>
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors select-none self-start sm:self-auto"
          onClick={openAddModal}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-zinc-900 bg-zinc-950/20">
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              className="w-full bg-[#09090b] border border-zinc-800 text-zinc-100 rounded-lg py-1.5 pl-9 pr-3 text-xs placeholder:text-zinc-550 outline-none focus:border-zinc-700 transition-colors"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-zinc-500 font-medium select-none">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Package size={36} />}
            title="No products found"
            description={searchTerm ? "Try adjusting your search query." : "Start by adding a new product to your inventory."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-zinc-950/40 border-b border-zinc-900">
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Product</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">SKU</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Price</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Stock</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Status</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-right uppercase px-5 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {filteredProducts.map((p) => {
                  let stockVariant = 'green';
                  let stockStatus = 'In Stock';
                  if (p.quantity_in_stock === 0) {
                    stockVariant = 'red';
                    stockStatus = 'Out of Stock';
                  } else if (p.quantity_in_stock <= 5) {
                    stockVariant = 'yellow';
                    stockStatus = 'Low Stock';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/25 transition-colors">
                      <td className="px-5 py-3.5 text-zinc-300 font-semibold">{p.name}</td>
                      <td className="px-5 py-3.5 text-zinc-550 font-mono text-xs">{p.sku}</td>
                      <td className="px-5 py-3.5 text-zinc-350 font-medium">${Number(p.price).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-zinc-350">{p.quantity_in_stock}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={stockVariant}>{stockStatus}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1.5">
                          <button
                            className="p-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-all"
                            onClick={() => openEditModal(p)}
                            aria-label={`Edit ${p.name}`}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="p-1.5 border border-zinc-800 text-rose-500/80 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all"
                            onClick={() => setDeletingProduct(p)}
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <Modal title="Add New Product" onClose={() => setIsAddOpen(false)}>
          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Product Name</label>
              <input
                type="text"
                className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700 transition-colors"
                placeholder="e.g. Wireless Mouse"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
              />
              {errors.name && <span className="text-[10px] text-rose-400 font-medium mt-0.5 block">{errors.name.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700 transition-colors"
                placeholder="e.g. MOUSE-WRLS-01"
                {...register('sku', {
                  required: 'SKU is required',
                  pattern: {
                    value: /^[A-Z0-9_-]+$/i,
                    message: 'SKU must be alphanumeric (letters, numbers, dash, underscore)'
                  }
                })}
              />
              {errors.sku && <span className="text-[10px] text-rose-400 font-medium mt-0.5 block">{errors.sku.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-zinc-700 transition-colors"
                  placeholder="0.00"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                />
                {errors.price && <span className="text-[10px] text-rose-400 font-medium mt-0.5 block">{errors.price.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Initial Stock</label>
                <input
                  type="number"
                  className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-zinc-700 transition-colors"
                  placeholder="0"
                  {...register('quantity_in_stock', {
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                />
                {errors.quantity_in_stock && <span className="text-[10px] text-rose-400 font-medium mt-0.5 block">{errors.quantity_in_stock.message}</span>}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-850 mt-5">
              <button 
                type="button" 
                className="px-3.5 py-1.5 border border-zinc-800 text-zinc-350 hover:bg-zinc-900 hover:text-white text-xs font-medium rounded-lg transition-colors" 
                onClick={() => setIsAddOpen(false)} 
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-3.5 py-1.5 bg-zinc-100 text-zinc-955 hover:bg-zinc-200 text-xs font-semibold rounded-lg transition-colors" 
                disabled={actionLoading}
              >
                {actionLoading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <Modal title={`Edit Product: ${editingProduct.name}`} onClose={() => setEditingProduct(null)}>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Product Name</label>
              <input
                type="text"
                className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-zinc-700 transition-colors"
                placeholder="Product Name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="text-[10px] text-rose-400 font-medium mt-0.5 block">{errors.name.message}</span>}
            </div>

            <div className="space-y-1.5 opacity-60 cursor-not-allowed">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">SKU (Cannot be changed)</label>
              <input
                type="text"
                className="w-full bg-zinc-900/20 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-400"
                value={editingProduct.sku}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 transition-colors"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                />
                {errors.price && <span className="text-[10px] text-rose-400 font-medium mt-0.5 block">{errors.price.message}</span>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Stock Quantity</label>
                <input
                  type="number"
                  className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 transition-colors"
                  {...register('quantity_in_stock', {
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                />
                {errors.quantity_in_stock && <span className="text-[10px] text-rose-400 font-medium mt-0.5 block">{errors.quantity_in_stock.message}</span>}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-850 mt-5">
              <button 
                type="button" 
                className="px-3.5 py-1.5 border border-zinc-800 text-zinc-355 hover:bg-zinc-900 hover:text-white text-xs font-medium rounded-lg transition-colors" 
                onClick={() => setEditingProduct(null)} 
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-3.5 py-1.5 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold rounded-lg transition-colors" 
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${deletingProduct.name}"? This action cannot be undone.`}
          onConfirm={onDeleteConfirm}
          onCancel={() => setDeletingProduct(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

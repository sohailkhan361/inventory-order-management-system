import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Search, Package, AlertTriangle } from 'lucide-react';
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
  if (error) return <div className="error-message">Error: {error}</div>;

  const products = data?.items || [];
  
  // Filter products based on search term
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory items and stock levels.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Package size={48} />}
            title="No products found"
            description={searchTerm ? "Try adjusting your search query." : "Start by adding a new product."}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Quantity in Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
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
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td className="td-muted">{p.sku}</td>
                      <td>${Number(p.price).toFixed(2)}</td>
                      <td>{p.quantity_in_stock}</td>
                      <td>
                        <Badge variant={stockVariant}>{stockStatus}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            onClick={() => openEditModal(p)}
                            aria-label={`Edit ${p.name}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => setDeletingProduct(p)}
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 size={14} />
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
          <form onSubmit={handleSubmit(onAddSubmit)}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Wireless Mouse"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">SKU (Stock Keeping Unit)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MOUSE-WRLS-01"
                {...register('sku', {
                  required: 'SKU is required',
                  pattern: {
                    value: /^[A-Z0-9_-]+$/i,
                    message: 'SKU must be alphanumeric (letters, numbers, dash, underscore)'
                  }
                })}
              />
              {errors.sku && <span className="form-error">{errors.sku.message}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                />
                {errors.price && <span className="form-error">{errors.price.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  {...register('quantity_in_stock', {
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                />
                {errors.quantity_in_stock && <span className="form-error">{errors.quantity_in_stock.message}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <Modal title={`Edit Product: ${editingProduct.name}`} onClose={() => setEditingProduct(null)}>
          <form onSubmit={handleSubmit(onEditSubmit)}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Product Name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">SKU (Cannot be changed)</label>
              <input
                type="text"
                className="form-input"
                value={editingProduct.sku}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                />
                {errors.price && <span className="form-error">{errors.price.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  {...register('quantity_in_stock', {
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' }
                  })}
                />
                {errors.quantity_in_stock && <span className="form-error">{errors.quantity_in_stock.message}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingProduct(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
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

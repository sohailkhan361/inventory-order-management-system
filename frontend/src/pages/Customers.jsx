import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2, Search, Users, Mail, Phone, Calendar } from 'lucide-react';
import { customerService } from '../services';
import { useFetch } from '../hooks/useFetch';
import { Spinner, EmptyState } from '../components/UI';
import { Modal, ConfirmModal } from '../components/Modal';

export default function Customers() {
  const { data, loading, error, refetch } = useFetch(() => customerService.getAll({ limit: 200 }));
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // React Hook Form for Add
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
    }
  });

  const openAddModal = () => {
    reset({
      full_name: '',
      email: '',
      phone_number: '',
    });
    setIsAddOpen(true);
  };

  // Submit handlers
  const onAddSubmit = async (formData) => {
    setActionLoading(true);
    try {
      await customerService.create(formData);
      toast.success('Customer registered successfully');
      setIsAddOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to register customer');
    } finally {
      setActionLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await customerService.delete(deletingCustomer.id);
      toast.success('Customer deleted successfully');
      setDeletingCustomer(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer. Ensure they have no existing orders.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  const customers = data?.items || [];
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Register new customers and view historical order accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Users size={48} />}
            title="No customers found"
            description={searchTerm ? "Try adjusting your search query." : "Start by registering a new customer."}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.full_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={14} className="td-muted" />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td>
                      {c.phone_number ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Phone size={14} className="td-muted" />
                          <span>{c.phone_number}</span>
                        </div>
                      ) : (
                        <span className="td-muted">—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => setDeletingCustomer(c)}
                        aria-label={`Delete ${c.full_name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddOpen && (
        <Modal title="Register Customer" onClose={() => setIsAddOpen(false)}>
          <form onSubmit={handleSubmit(onAddSubmit)}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                {...register('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
              />
              {errors.full_name && <span className="form-error">{errors.full_name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. john.doe@example.com"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address shape'
                  }
                })}
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +1 555-0199"
                {...register('phone_number')}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Registering...' : 'Register Customer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <ConfirmModal
          title="Delete Customer"
          message={`Are you sure you want to delete customer "${deletingCustomer.full_name}"? This action cannot be undone.`}
          onConfirm={onDeleteConfirm}
          onCancel={() => setDeletingCustomer(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

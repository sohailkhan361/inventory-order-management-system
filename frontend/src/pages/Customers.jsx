import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2, Search, Users, Mail, Phone } from 'lucide-react';
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
  if (error) return <div className="text-rose-450 text-xs py-10 text-center">Error: {error}</div>;

  const customers = data?.items || [];
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Customers</h2>
          <p className="text-xs text-zinc-400 mt-1">Register customer profiles and view their accounts details.</p>
        </div>
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors select-none self-start sm:self-auto"
          onClick={openAddModal}
        >
          <Plus size={14} /> Add Customer
        </button>
      </div>

      <div className="bg-[#09090b] border border-zinc-900 rounded-xl overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-zinc-900 bg-zinc-950/20">
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              className="w-full bg-[#09090b] border border-zinc-800 text-zinc-100 rounded-lg py-1.5 pl-9 pr-3 text-xs placeholder:text-zinc-550 outline-none focus:border-zinc-700 transition-colors"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-zinc-500 font-medium select-none">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Users size={36} />}
            title="No customers found"
            description={searchTerm ? "Try adjusting your search query." : "Start by registering a new customer profile."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-zinc-950/40 border-b border-zinc-900">
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Customer Name</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Email Address</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-left uppercase px-5 py-2.5">Phone Number</th>
                  <th className="text-[11px] font-semibold text-zinc-400 tracking-wider text-right uppercase px-5 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/25 transition-colors">
                    <td className="px-5 py-3.5 text-zinc-300 font-semibold">{c.full_name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-zinc-350">
                        <Mail size={13} className="text-zinc-500" />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-350">
                      {c.phone_number ? (
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-zinc-500" />
                          <span>{c.phone_number}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600 font-medium">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        className="p-1.5 border border-zinc-800 text-rose-500/80 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all"
                        onClick={() => setDeletingCustomer(c)}
                        aria-label={`Delete ${c.full_name}`}
                      >
                        <Trash2 size={13} />
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
          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Full Name</label>
              <input
                type="text"
                className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700 transition-colors"
                placeholder="e.g. John Doe"
                {...register('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
              />
              {errors.full_name && <span className="text-[10px] text-rose-450 font-medium mt-0.5 block">{errors.full_name.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Email Address</label>
              <input
                type="email"
                className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700 transition-colors"
                placeholder="e.g. john.doe@example.com"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address format'
                  }
                })}
              />
              {errors.email && <span className="text-[10px] text-rose-450 font-medium mt-0.5 block">{errors.email.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Phone Number (Optional)</label>
              <input
                type="tel"
                className="w-full bg-zinc-900/50 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700 transition-colors"
                placeholder="e.g. +1 555-0199"
                {...register('phone_number')}
              />
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
                className="px-3.5 py-1.5 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold rounded-lg transition-colors" 
                disabled={actionLoading}
              >
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

import { X } from 'lucide-react';

export function Modal({ title, children, onClose, size = '' }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const widthClass = size === 'modal-lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={handleBackdrop}
    >
      <div 
        className={`bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full ${widthClass} max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200 flex flex-col`}
        role="dialog" 
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-850">
          <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h2>
          <button
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 p-1.5 rounded-lg transition-colors"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div 
        className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850">
          <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h2>
          <button 
            className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 p-1.5 rounded-lg transition-colors" 
            onClick={onCancel}
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5 text-center">
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-2 justify-end">
            <button 
              className="px-3.5 py-1.5 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors" 
              onClick={onCancel} 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="px-3.5 py-1.5 rounded-lg bg-red-950/40 border border-red-900/30 text-xs font-medium text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors" 
              onClick={onConfirm} 
              disabled={loading}
            >
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 text-zinc-500">
      <div className="text-zinc-600 mb-3 opacity-60">
        {icon}
      </div>
      <h3 className="text-zinc-200 text-sm font-medium mb-1">{title}</h3>
      {description && <p className="text-xs text-zinc-500 max-w-sm">{description}</p>}
    </div>
  );
}

const BADGE_VARIANTS = {
  blue: 'bg-blue-500/8 text-blue-400 border border-blue-500/15',
  green: 'bg-emerald-500/8 text-emerald-400 border border-emerald-500/15',
  red: 'bg-rose-500/8 text-rose-400 border border-rose-500/15',
  yellow: 'bg-amber-500/8 text-amber-400 border border-amber-500/15',
  purple: 'bg-violet-500/8 text-violet-400 border border-violet-500/15',
};

export function Badge({ variant = 'blue', children }) {
  const badgeClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.blue;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium select-none ${badgeClass}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, icon, accentColor }) {
  return (
    <div className="relative overflow-hidden bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 hover:border-zinc-700/80 transition-all duration-200 group">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-200 opacity-60 group-hover:opacity-100" style={{ backgroundColor: accentColor }} />
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-400 font-medium tracking-tight uppercase">{label}</span>
        <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-300 group-hover:text-zinc-100 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-semibold tracking-tight text-white">{value ?? '—'}</div>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="empty-state">
      {icon}
      <h3 style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export function Badge({ variant = 'blue', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function StatCard({ label, value, icon, accentColor, accentDim }) {
  return (
    <div
      className="stat-card"
      style={{ '--card-accent': accentColor, '--card-accent-dim': accentDim }}
    >
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

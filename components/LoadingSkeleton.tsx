export function ChannelSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="content-grid channels">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-channel" />
      ))}
    </div>
  );
}

export function MediaSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="content-grid movies">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="stats-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  );
}

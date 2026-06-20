import { Sparkles } from 'lucide-react';

export default function EmptyState({ icon: Icon = Sparkles, title, description, action }) {
  return (
    <div
      className="card fade-up"
      style={{
        padding: 56,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(255,155,38,0.15), rgba(238,76,39,0.1))',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--orange)',
          border: '1px solid rgba(255, 155, 38, 0.25)',
        }}
      >
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        {description && (
          <div style={{ color: 'var(--muted)', fontSize: 13.5, maxWidth: 380 }}>
            {description}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

import { Sparkles } from 'lucide-react';

export default function PlaceholderPage({ title, description }) {
  return (
    <div
      className="card fade-up"
      style={{
        padding: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background:
            'linear-gradient(135deg, rgba(255,155,38,0.18), rgba(238,76,39,0.12))',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--orange)',
          border: '1px solid rgba(255, 155, 38, 0.25)',
        }}
      >
        <Sparkles size={24} strokeWidth={1.75} />
      </div>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 6,
          }}
        >
          {title}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 13.5, maxWidth: 420 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

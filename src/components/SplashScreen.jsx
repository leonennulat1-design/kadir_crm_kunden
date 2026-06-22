export default function SplashScreen({ text = 'Wird geladen…' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(255,155,38,0.15)',
          borderTopColor: 'var(--orange)',
          animation: 'spin 0.9s linear infinite',
        }}
      />
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 13,
          color: 'var(--muted)',
          letterSpacing: '0.04em',
        }}
      >
        {text}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

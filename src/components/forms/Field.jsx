export default function Field({ label, required, hint, children, style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.02em',
          color: 'var(--text)',
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--orange)', marginLeft: 4 }}>*</span>}
      </span>
      {children}
      {hint && (
        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{hint}</span>
      )}
    </label>
  );
}

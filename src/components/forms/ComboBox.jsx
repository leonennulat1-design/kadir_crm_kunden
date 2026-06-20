import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ComboBox({
  value,
  onChange,
  options = [],
  placeholder = 'Auswählen oder neu eintippen…',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const lower = (value ?? '').toLowerCase();
  const filtered = options.filter(
    (o) => !lower || o.toLowerCase().includes(lower)
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className="input"
        value={value ?? ''}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{ paddingRight: 36 }}
      />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Optionen anzeigen"
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--muted)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <ChevronDown size={16} strokeWidth={1.75} />
      </button>

      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            maxHeight: 220,
            overflowY: 'auto',
            zIndex: 30,
            boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
          }}
        >
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--text)',
                background:
                  opt === value ? 'rgba(255,155,38,0.1)' : 'transparent',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  opt === value ? 'rgba(255,155,38,0.1)' : 'transparent')
              }
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

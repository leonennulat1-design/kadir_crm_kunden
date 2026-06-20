import { useEffect, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function MultiComboBox({
  values = [],
  onChange,
  options = [],
  placeholder = 'Eintippen, Enter zum Hinzufügen',
}) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const add = (val) => {
    const v = val.trim();
    if (!v) return;
    if (values.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...values, v]);
    setInput('');
  };

  const remove = (val) => onChange(values.filter((v) => v !== val));

  const lower = input.toLowerCase();
  const suggestions = options.filter(
    (o) =>
      (!lower || o.toLowerCase().includes(lower)) &&
      !values.some((v) => v.toLowerCase() === o.toLowerCase())
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div
        className="input"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
          padding: 8,
          minHeight: 44,
        }}
        onClick={() => setOpen(true)}
      >
        {values.map((v) => (
          <span
            key={v}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              borderRadius: 8,
              background: 'rgba(255,155,38,0.14)',
              color: 'var(--orange)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {v}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(v);
              }}
              aria-label={`Entfernen: ${v}`}
              style={{ color: 'inherit', display: 'grid', placeItems: 'center' }}
            >
              <X size={12} strokeWidth={2} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(input);
            } else if (e.key === 'Backspace' && !input && values.length) {
              remove(values[values.length - 1]);
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={values.length ? '' : placeholder}
          style={{
            flex: 1,
            minWidth: 120,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontSize: 13.5,
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {open && (suggestions.length > 0 || input.trim()) && (
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
          {input.trim() &&
            !options.some((o) => o.toLowerCase() === lower) &&
            !values.some((v) => v.toLowerCase() === lower) && (
              <button
                type="button"
                onClick={() => add(input)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'var(--orange)',
                  fontWeight: 600,
                }}
              >
                <Plus size={14} strokeWidth={2} />
                "{input.trim()}" hinzufügen
              </button>
            )}
          {suggestions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => add(opt)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--text)',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
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

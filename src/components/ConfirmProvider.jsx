import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from './Modal.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [opts, setOpts] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOpts({
        title: options.title || 'Bestätigen',
        body: options.body || '',
        confirmLabel: options.confirmLabel || 'Bestätigen',
        cancelLabel: options.cancelLabel || 'Abbrechen',
        danger: !!options.danger,
      });
    });
  }, []);

  const close = (result) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setOpts(null);
    r?.(result);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!opts}
        onClose={() => close(false)}
        title={opts?.title ?? ''}
        width={460}
        footer={
          <>
            <button className="btn-ghost" onClick={() => close(false)}>
              {opts?.cancelLabel}
            </button>
            <button
              className={opts?.danger ? 'btn-danger' : 'btn-primary'}
              onClick={() => close(true)}
              autoFocus
            >
              {opts?.confirmLabel}
            </button>
          </>
        }
      >
        {opts?.body && (
          <div
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: 13.5,
              lineHeight: 1.55,
              color: 'var(--text)',
            }}
          >
            {opts.body}
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

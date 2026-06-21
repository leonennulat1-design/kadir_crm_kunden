import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import Modal from './Modal.jsx';
import { useStore } from '../store/StoreProvider.jsx';

export default function FeedbackButton() {
  const { createFeedback } = useStore();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    createFeedback({ text, page: pathname });
    setText('');
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="btn-ghost"
        onClick={() => setOpen(true)}
        style={{ padding: '8px 12px', fontSize: 12.5 }}
      >
        <MessageSquare size={14} strokeWidth={1.75} />
        Feedback
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Feedback zur App"
        width={520}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button className="btn-primary" onClick={submit} disabled={!text.trim()}>
              Speichern
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            Was nervt, was fehlt, was sollte anders sein? Zeitstempel und aktuelle Seite werden
            automatisch mitgespeichert. Du findest deine Einträge unter <em>Feedback</em>.
          </div>
          <textarea
            className="input"
            rows={6}
            placeholder="Dein Feedback…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            Aktuelle Seite: <code>{pathname}</code>
          </div>
        </div>
      </Modal>
    </>
  );
}

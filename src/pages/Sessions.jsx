import { useMemo, useState } from 'react';
import { CalendarDays, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { SESSION_TYPES, formatDate } from '../lib/format.js';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/forms/Field.jsx';

function emptyForm() {
  return {
    caseId: '',
    date: new Date().toISOString().slice(0, 10),
    type: SESSION_TYPES[0].value,
    intervention: '',
    ahaMoment: '',
    result: '',
    nextStep: '',
    nextContact: '',
    recordingLink: '',
    consentGiven: false,
    contentIdea: '',
  };
}

export default function Sessions() {
  const { state, createSession, deleteSession } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const caseByNumber = useMemo(
    () => Object.fromEntries(state.cases.map((c) => [c.id, c.number])),
    [state.cases]
  );
  const customerForCase = useMemo(
    () =>
      Object.fromEntries(
        state.cases.map((c) => {
          const cust = state.customers.find((cu) => cu.id === c.customerId);
          return [c.id, cust?.number ?? '–'];
        })
      ),
    [state.cases, state.customers]
  );
  const typeLabel = (v) =>
    SESSION_TYPES.find((s) => s.value === v)?.label ?? v ?? '–';

  const rows = useMemo(
    () =>
      [...state.sessions].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [state.sessions]
  );

  const startCreate = () => {
    setForm(emptyForm());
    setError('');
    setOpen(true);
  };

  const save = () => {
    if (!form.caseId) return setError('Fall auswählen.');
    if (!form.consentGiven)
      return setError('Ohne Einverständnis kann die Session nicht gespeichert werden.');
    try {
      createSession(form);
      setOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-primary"
          onClick={startCreate}
          disabled={!state.cases.length}
          style={{
            opacity: state.cases.length ? 1 : 0.5,
            cursor: state.cases.length ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={16} strokeWidth={2} /> Neue Session
        </button>
      </div>

      {!state.cases.length ? (
        <EmptyState
          icon={CalendarDays}
          title="Erst Fälle, dann Sessions"
          description="Eine Session gehört immer zu einem Fall. Lege zuerst einen Fall an."
        />
      ) : (
        <DataTable
          columns={[
            {
              key: 'date',
              label: 'Datum',
              width: 110,
              render: (s) => formatDate(s.date),
            },
            {
              key: 'caseNumber',
              label: 'Fall',
              width: 90,
              render: (s) => caseByNumber[s.caseId] ?? '–',
            },
            {
              key: 'customerNumber',
              label: 'Kunde',
              width: 90,
              render: (s) => customerForCase[s.caseId] ?? '–',
            },
            {
              key: 'type',
              label: 'Typ',
              render: (s) => typeLabel(s.type),
            },
            {
              key: 'consent',
              label: 'Einverständnis',
              width: 140,
              render: () => (
                <span className="pill pill-success">
                  <ShieldCheck size={11} strokeWidth={2} /> bestätigt
                </span>
              ),
            },
            {
              key: 'actions',
              label: '',
              width: 60,
              render: (s) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Session löschen?')) deleteSession(s.id);
                  }}
                  aria-label="Löschen"
                  style={{ color: 'var(--muted)', padding: 4 }}
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              ),
            },
          ]}
          rows={rows}
          empty={
            <EmptyState
              icon={CalendarDays}
              title="Noch keine Sessions"
              description="Sobald du eine Session dokumentierst, erscheint sie hier."
              action={
                <button className="btn-primary" onClick={startCreate}>
                  <Plus size={16} strokeWidth={2} /> Erste Session anlegen
                </button>
              }
            />
          }
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Neue Session"
        width={720}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button
              className="btn-primary"
              onClick={save}
              disabled={!form.caseId || !form.consentGiven}
              style={{
                opacity: !form.caseId || !form.consentGiven ? 0.5 : 1,
                cursor: !form.caseId || !form.consentGiven ? 'not-allowed' : 'pointer',
              }}
            >
              Speichern
            </button>
          </>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
          }}
        >
          <Field label="Fall" required>
            <select
              className="input"
              value={form.caseId}
              onChange={(e) => set('caseId')(e.target.value)}
            >
              <option value="">Fall auswählen…</option>
              {state.cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.number} – {customerForCase[c.id] ?? '–'}
                  {c.conflictTopic ? ` (${c.conflictTopic.slice(0, 40)})` : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Datum">
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => set('date')(e.target.value)}
            />
          </Field>

          <Field label="Typ" style={{ gridColumn: 'span 2' }}>
            <select
              className="input"
              value={form.type}
              onChange={(e) => set('type')(e.target.value)}
            >
              {SESSION_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Eingesetzte Intervention" style={{ gridColumn: 'span 2' }}>
            <textarea
              className="input"
              rows={2}
              value={form.intervention}
              onChange={(e) => set('intervention')(e.target.value)}
            />
          </Field>

          <Field label="Aha-Moment">
            <textarea
              className="input"
              rows={2}
              value={form.ahaMoment}
              onChange={(e) => set('ahaMoment')(e.target.value)}
            />
          </Field>

          <Field label="Ergebnis">
            <textarea
              className="input"
              rows={2}
              value={form.result}
              onChange={(e) => set('result')(e.target.value)}
            />
          </Field>

          <Field label="Nächster Schritt">
            <textarea
              className="input"
              rows={2}
              value={form.nextStep}
              onChange={(e) => set('nextStep')(e.target.value)}
            />
          </Field>

          <Field label="Nächster Kontaktpunkt">
            <input
              className="input"
              type="date"
              value={form.nextContact}
              onChange={(e) => set('nextContact')(e.target.value)}
            />
          </Field>

          <Field label="Aufnahme-Link" style={{ gridColumn: 'span 2' }}>
            <input
              className="input"
              type="url"
              placeholder="https://…"
              value={form.recordingLink}
              onChange={(e) => set('recordingLink')(e.target.value)}
            />
          </Field>

          <Field label="Content-Idee" style={{ gridColumn: 'span 2' }}>
            <textarea
              className="input"
              rows={2}
              value={form.contentIdea}
              onChange={(e) => set('contentIdea')(e.target.value)}
            />
          </Field>

          <div
            style={{
              gridColumn: 'span 2',
              padding: 14,
              borderRadius: 10,
              background: form.consentGiven
                ? 'rgba(74,222,128,0.08)'
                : 'rgba(238,76,39,0.08)',
              border: `1px solid ${
                form.consentGiven ? 'rgba(74,222,128,0.3)' : 'rgba(238,76,39,0.3)'
              }`,
            }}
          >
            <label
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={form.consentGiven}
                onChange={(e) => set('consentGiven')(e.target.checked)}
                style={{
                  marginTop: 2,
                  width: 18,
                  height: 18,
                  accentColor: '#ff9b26',
                }}
              />
              <span style={{ fontSize: 13.5 }}>
                <strong
                  style={{
                    fontFamily: 'var(--font-heading)',
                    display: 'block',
                    marginBottom: 2,
                  }}
                >
                  Einverständnis liegt vor *
                </strong>
                <span style={{ color: 'var(--muted)' }}>
                  Pflichtfeld. Ohne explizite Bestätigung kann diese Session nicht
                  gespeichert werden.
                </span>
              </span>
            </label>
          </div>

          {error && (
            <div
              style={{
                gridColumn: 'span 2',
                color: '#ff8888',
                fontSize: 12.5,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

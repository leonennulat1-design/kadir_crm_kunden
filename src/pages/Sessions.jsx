import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  ShieldCheck,
  Wand2,
  Upload,
  Download,
  X,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { SESSION_TYPES, formatDate } from '../lib/format.js';
import { saveFile, downloadFile } from '../lib/files.js';
import { parseDescription, DESCRIPTION_LABELS } from '../lib/parseDescription.js';
import { uid } from '../lib/ids.js';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/forms/Field.jsx';

function emptyForm() {
  return {
    caseId: '',
    date: new Date().toISOString().slice(0, 10),
    type: SESSION_TYPES[0].value,
    description: '',
    intervention: '',
    ahaMoment: '',
    result: '',
    nextStep: '',
    nextContact: '',
    recordingLink: '',
    transcript: '',
    consentGiven: false,
    contentIdea: '',
    consentFile: null,
  };
}

export default function Sessions() {
  const { state, createSession, deleteSession } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const applyDescriptionParse = () => {
    const parsed = parseDescription(form.description);
    setForm((f) => ({
      ...f,
      description: parsed.description ?? '',
      intervention: parsed.intervention || f.intervention,
      ahaMoment: parsed.ahaMoment || f.ahaMoment,
      result: parsed.result || f.result,
      nextStep: parsed.nextStep || f.nextStep,
      contentIdea: parsed.contentIdea || f.contentIdea,
    }));
  };

  const save = async () => {
    if (!form.caseId) return setError('Bitte einen Fall auswählen.');
    if (!form.consentGiven)
      return setError('Ohne Einverständnis-Häkchen kann die Session nicht gespeichert werden.');
    setBusy(true);
    setError('');
    try {
      let consentFileId = '';
      let consentFileName = '';
      let consentFileType = '';
      if (form.consentFile) {
        consentFileId = uid();
        await saveFile(consentFileId, form.consentFile);
        consentFileName = form.consentFile.name;
        consentFileType = form.consentFile.type || 'application/octet-stream';
      }
      createSession({
        caseId: form.caseId,
        date: form.date,
        type: form.type,
        description: form.description,
        intervention: form.intervention,
        ahaMoment: form.ahaMoment,
        result: form.result,
        nextStep: form.nextStep,
        nextContact: form.nextContact,
        recordingLink: form.recordingLink,
        transcript: form.transcript,
        consentGiven: true,
        contentIdea: form.contentIdea,
        consentFileId,
        consentFileName,
        consentFileType,
      });
      setOpen(false);
    } catch (e) {
      setError(e.message ?? 'Speichern fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

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
              width: 180,
              render: (s) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pill pill-success">
                    <ShieldCheck size={11} strokeWidth={2} /> bestätigt
                  </span>
                  {s.consentFileId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(s.consentFileId);
                      }}
                      title={s.consentFileName || 'Datei herunterladen'}
                      style={{
                        color: 'var(--muted)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Download size={13} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
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
        width={760}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button className="btn-primary" onClick={save} disabled={busy}>
              {busy ? 'Speichere…' : 'Speichern'}
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
          <Field
            label="Beschreibung"
            hint="Bitte anonymisiert einfügen, keine Klarnamen."
            style={{ gridColumn: 'span 2' }}
          >
            <textarea
              className="input"
              rows={6}
              placeholder="Vorstrukturierten Fließtext aus deiner externen KI hier einfügen. Mit den Labels unten kannst du den Inhalt automatisch in die Felder verteilen."
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
            />
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn-ghost"
                onClick={applyDescriptionParse}
                disabled={!form.description.trim()}
                style={{
                  opacity: form.description.trim() ? 1 : 0.5,
                  cursor: form.description.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 12.5,
                }}
              >
                <Wand2 size={14} strokeWidth={1.75} /> Felder aus Beschreibung füllen
              </button>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                Erkannte Labels:{' '}
                {DESCRIPTION_LABELS.map((l) => l.label).join('  ·  ')}
              </span>
            </div>
          </Field>

          <Field label="Fall" required>
            <select
              className="input"
              value={form.caseId}
              onChange={(e) => {
                set('caseId')(e.target.value);
                if (e.target.value) setError('');
              }}
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

          <Field
            label="Transkript (anonymisiert)"
            hint="Nur anonymisierte Transkripte einfügen. Namen durch Rollen ersetzen (z. B. Partnerin A, Sohn, Hund)."
            style={{ gridColumn: 'span 2' }}
          >
            <textarea
              className="input"
              rows={5}
              value={form.transcript}
              onChange={(e) => set('transcript')(e.target.value)}
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
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
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
                onChange={(e) => {
                  set('consentGiven')(e.target.checked);
                  if (e.target.checked) setError('');
                }}
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
                  Pflichtfeld. Ohne explizite Bestätigung kann diese Session nicht gespeichert werden.
                </span>
              </span>
            </label>

            <ConsentFileUpload
              file={form.consentFile}
              onChange={(file) => set('consentFile')(file)}
            />
          </div>

          {error && (
            <div
              style={{
                gridColumn: 'span 2',
                display: 'flex',
                gap: 10,
                padding: 12,
                borderRadius: 10,
                background: 'rgba(238,76,39,0.1)',
                border: '1px solid rgba(238,76,39,0.3)',
                color: '#ff8888',
                fontSize: 13,
              }}
            >
              <AlertCircle size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function ConsentFileUpload({ file, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingTop: 8,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <label
        className="btn-ghost"
        style={{ cursor: 'pointer', fontSize: 12.5 }}
      >
        <Upload size={14} strokeWidth={1.75} />
        {file ? 'Andere Datei wählen' : 'Einverständnis-Datei hochladen'}
        <input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />
      </label>
      {file ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: 'var(--text)',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Datei entfernen"
            style={{ color: 'var(--muted)' }}
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
          Beliebiges Format. Lokal abgelegt, nicht öffentlich.
        </span>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderOpen, Plus, Trash2, AlertCircle, Wand2 } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/forms/Field.jsx';
import ComboBox from '../components/forms/ComboBox.jsx';
import MultiComboBox from '../components/forms/MultiComboBox.jsx';
import { pickFields, pluralize } from '../lib/forms.js';
import {
  parseCaseDescription,
  CASE_DESCRIPTION_LABELS,
} from '../lib/parseDescription.js';
import { useConfirm } from '../components/ConfirmProvider.jsx';

const CASE_FIELDS = [
  'customerId',
  'description',
  'relationshipType',
  'symptom',
  'trigger',
  'conflictTopic',
  'dynamic',
  'protectionPattern',
  'need',
  'linkedPatterns',
  'linkedTopics',
];

function emptyForm() {
  return {
    customerId: '',
    description: '',
    relationshipType: '',
    symptom: '',
    trigger: '',
    conflictTopic: '',
    dynamic: '',
    protectionPattern: '',
    need: '',
    linkedPatterns: [],
    linkedTopics: [],
  };
}

export default function Faelle() {
  const { state, createCase, updateCase, deleteCase } = useStore();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const filterCustomerId = params.get('kunde') || '';

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const customerByNumber = useMemo(
    () => Object.fromEntries(state.customers.map((c) => [c.id, c.number])),
    [state.customers]
  );
  const patternByName = useMemo(
    () => Object.fromEntries(state.patterns.map((p) => [p.id, p.name])),
    [state.patterns]
  );

  const rows = useMemo(() => {
    const list = filterCustomerId
      ? state.cases.filter((c) => c.customerId === filterCustomerId)
      : state.cases;
    return [...list].sort((a, b) => b.number.localeCompare(a.number));
  }, [state.cases, filterCustomerId]);

  const startCreate = () => {
    setEditingId(null);
    setError('');
    setForm({ ...emptyForm(), customerId: filterCustomerId || '' });
    setOpen(true);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setError('');
    setForm({
      customerId: c.customerId,
      description: c.description ?? '',
      relationshipType: c.relationshipType,
      symptom: c.symptom,
      trigger: c.trigger,
      conflictTopic: c.conflictTopic,
      dynamic: c.dynamic,
      protectionPattern: c.protectionPattern,
      need: c.need,
      linkedPatterns: c.linkedPatterns ?? [],
      linkedTopics: c.linkedTopics ?? [],
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.customerId) {
      setError('Bitte einen Kunden auswählen, bevor du den Fall speicherst.');
      return;
    }
    setError('');
    try {
      const patch = pickFields(form, CASE_FIELDS);
      if (editingId) updateCase(editingId, patch);
      else createCase(patch);
      setOpen(false);
    } catch (e) {
      setError(e.message ?? 'Speichern fehlgeschlagen.');
    }
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const applyDescriptionParse = () => {
    const parsed = parseCaseDescription(form.description);
    setForm((f) => {
      const newTopics = parsed.linkedTopics.length
        ? [
            ...f.linkedTopics,
            ...parsed.linkedTopics.filter(
              (t) => !f.linkedTopics.some((x) => x.toLowerCase() === t.toLowerCase())
            ),
          ]
        : f.linkedTopics;
      return {
        ...f,
        description: parsed.description ?? '',
        relationshipType: parsed.relationshipType || f.relationshipType,
        symptom: parsed.symptom || f.symptom,
        trigger: parsed.trigger || f.trigger,
        conflictTopic: parsed.conflictTopic || f.conflictTopic,
        dynamic: parsed.dynamic || f.dynamic,
        protectionPattern: parsed.protectionPattern || f.protectionPattern,
        need: parsed.need || f.need,
        linkedTopics: newTopics,
      };
    });
  };

  const linkedPatternNames = form.linkedPatterns.map((id) => patternByName[id]).filter(Boolean);

  const togglePattern = (names) => {
    const ids = names
      .map((name) => state.patterns.find((p) => p.name === name)?.id)
      .filter(Boolean);
    set('linkedPatterns')(ids);
  };

  const filterCustomer = filterCustomerId
    ? state.customers.find((c) => c.id === filterCustomerId)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {filterCustomer ? (
          <div
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255,155,38,0.12)',
              border: '1px solid rgba(255,155,38,0.25)',
              fontSize: 13,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span>Gefiltert nach Kunde </span>
            <strong style={{ color: 'var(--orange)' }}>{filterCustomer.number}</strong>
            <button
              type="button"
              onClick={() => setParams({})}
              style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 6 }}
            >
              Filter entfernen
            </button>
          </div>
        ) : (
          <div />
        )}
        <button
          className="btn-primary"
          onClick={startCreate}
          disabled={!state.customers.length}
          style={{
            opacity: state.customers.length ? 1 : 0.5,
            cursor: state.customers.length ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={16} strokeWidth={2} /> Neuer Fall
        </button>
      </div>

      {!state.customers.length ? (
        <EmptyState
          icon={FolderOpen}
          title="Erst Kunden, dann Fälle"
          description="Lege zuerst mindestens einen Kunden an. Fälle werden immer einem Kunden zugeordnet."
        />
      ) : (
        <DataTable
          columns={[
            { key: 'number', label: 'Fall-Nr.', width: 100 },
            {
              key: 'customer',
              label: 'Kunde',
              width: 110,
              render: (c) => customerByNumber[c.customerId] ?? '–',
            },
            { key: 'relationshipType', label: 'Beziehung', width: 160 },
            { key: 'conflictTopic', label: 'Konfliktthema' },
            {
              key: 'patterns',
              label: 'Muster',
              render: (c) => {
                const names = (c.linkedPatterns ?? [])
                  .map((id) => patternByName[id])
                  .filter(Boolean);
                if (!names.length) return <span style={{ color: 'var(--muted)' }}>–</span>;
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {names.map((n) => (
                      <span key={n} className="pill pill-warning">
                        {n}
                      </span>
                    ))}
                  </div>
                );
              },
            },
            {
              key: 'actions',
              label: '',
              width: 60,
              render: (c) => (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const sessionCount = state.sessions.filter(
                      (s) => s.caseId === c.id
                    ).length;
                    const ok = await confirm({
                      title: `Fall ${c.number} löschen?`,
                      body: sessionCount
                        ? `${pluralize(sessionCount, 'Session', 'Sessions')} werden ebenfalls gelöscht.`
                        : '',
                      confirmLabel: 'Löschen',
                      danger: true,
                    });
                    if (ok) deleteCase(c.id);
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
          onRowClick={startEdit}
          empty={
            <EmptyState
              icon={FolderOpen}
              title="Noch keine Fälle"
              description="Dokumentiere echte Konfliktfälle deiner Kunden – die Basis für die Mustererkennung."
              action={
                <button className="btn-primary" onClick={startCreate}>
                  <Plus size={16} strokeWidth={2} /> Ersten Fall anlegen
                </button>
              }
            />
          }
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? 'Fall bearbeiten' : 'Neuer Fall'}
        width={760}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button className="btn-primary" onClick={save}>
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

          <Field
            label="Beschreibung"
            hint="Bitte anonymisiert einfügen, keine Klarnamen."
            style={{ gridColumn: 'span 2' }}
          >
            <textarea
              className="input"
              rows={6}
              placeholder="Vorstrukturierten Fließtext hier einfügen. Mit den Labels unten kannst du den Inhalt automatisch in die Felder verteilen."
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
                {CASE_DESCRIPTION_LABELS.map((l) => l.label).join('  ·  ')}
              </span>
            </div>
          </Field>

          <Field label="Kunde" required style={{ gridColumn: 'span 2' }}>
            <select
              className="input"
              value={form.customerId}
              onChange={(e) => {
                set('customerId')(e.target.value);
                if (e.target.value) setError('');
              }}
            >
              <option value="">Kunde auswählen…</option>
              {state.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.number}
                  {c.source ? ` – ${c.source}` : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Beziehung">
            <ComboBox
              value={form.relationshipType}
              onChange={set('relationshipType')}
              options={state.vocab.relationships}
            />
          </Field>

          <Field label="Schutzmuster">
            <ComboBox
              value={form.protectionPattern}
              onChange={set('protectionPattern')}
              options={state.vocab.protectionPatterns}
            />
          </Field>

          <Field label="Symptom" style={{ gridColumn: 'span 2' }}>
            <textarea
              className="input"
              rows={2}
              placeholder="Was ist konkret sichtbar passiert?"
              value={form.symptom}
              onChange={(e) => set('symptom')(e.target.value)}
            />
          </Field>

          <Field label="Auslöser">
            <textarea
              className="input"
              rows={2}
              placeholder="Was hat es ausgelöst? Welche Situation davor?"
              value={form.trigger}
              onChange={(e) => set('trigger')(e.target.value)}
            />
          </Field>

          <Field label="Konfliktthema" hint="Bewusst getrennt vom Symptom.">
            <textarea
              className="input"
              rows={2}
              placeholder="Worum geht es im Kern? Welches Thema steht dahinter?"
              value={form.conflictTopic}
              onChange={(e) => set('conflictTopic')(e.target.value)}
            />
          </Field>

          <Field label="Darunterliegende Dynamik" style={{ gridColumn: 'span 2' }}>
            <textarea
              className="input"
              rows={2}
              placeholder="Welches Muster läuft unter der Oberfläche ab? Wer reagiert worauf?"
              value={form.dynamic}
              onChange={(e) => set('dynamic')(e.target.value)}
            />
          </Field>

          <Field label="Bedürfnis" hint="Liste wächst mit deiner Eingabe.">
            <ComboBox
              value={form.need}
              onChange={set('need')}
              options={state.vocab.needs}
            />
          </Field>

          <Field label="Themen / Schlagworte" hint="Mehrfach möglich.">
            <MultiComboBox
              values={form.linkedTopics}
              onChange={set('linkedTopics')}
              options={state.vocab.topics}
            />
          </Field>

          <Field
            label="Verknüpfte Muster"
            hint="Nur Muster aus der Methoden-Bibliothek wählbar. Tippfehler werden verworfen."
            style={{ gridColumn: 'span 2' }}
          >
            <MultiComboBox
              values={linkedPatternNames}
              onChange={togglePattern}
              options={state.patterns.map((p) => p.name)}
              placeholder="Muster auswählen…"
              strict
            />
            {!state.patterns.length && (
              <span style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>
                Noch keine Muster angelegt. Du kannst Muster zuerst unter „Muster" erfassen.
              </span>
            )}
          </Field>
        </div>
      </Modal>
    </div>
  );
}

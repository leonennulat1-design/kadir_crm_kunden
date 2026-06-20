import { useMemo, useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { useStore, usePatternUsage } from '../store/StoreProvider.jsx';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/forms/Field.jsx';

const STATUS_OPTIONS = ['Hypothese', 'Bestätigt'];

function emptyForm() {
  return {
    name: '',
    description: '',
    typicalSymptoms: '',
    typicalIntervention: '',
    status: 'Hypothese',
  };
}

export default function Muster() {
  const { state, createPattern, updatePattern, deletePattern } = useStore();
  const usage = usePatternUsage();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const rows = useMemo(() => {
    return [...state.patterns]
      .map((p) => ({ ...p, count: usage.get(p.id) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.number.localeCompare(b.number));
  }, [state.patterns, usage]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      typicalSymptoms: p.typicalSymptoms,
      typicalIntervention: p.typicalIntervention,
      status: p.status,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editingId) updatePattern(editingId, form);
    else createPattern(form);
    setOpen(false);
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            background: 'rgba(255,155,38,0.06)',
            border: '1px solid rgba(255,155,38,0.18)',
            fontSize: 13,
            color: 'var(--text)',
          }}
        >
          <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--orange)' }}>
            Methoden-Bibliothek
          </strong>
          <div style={{ marginTop: 6, color: 'var(--muted)' }}>
            Muster sammeln, was sich über Fälle hinweg wiederholt. Der Häufigkeitszähler steigt
            automatisch, sobald ein Fall ein Muster verknüpft.
          </div>
        </div>
        <button className="btn-primary" onClick={startCreate}>
          <Plus size={16} strokeWidth={2} /> Neues Muster
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'number', label: 'Nr.', width: 80 },
          { key: 'name', label: 'Name' },
          {
            key: 'status',
            label: 'Status',
            width: 130,
            render: (p) => (
              <span
                className={`pill ${
                  p.status === 'Bestätigt' ? 'pill-success' : 'pill-warning'
                }`}
              >
                {p.status}
              </span>
            ),
          },
          {
            key: 'count',
            label: 'Häufigkeit',
            width: 120,
            render: (p) => (
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {p.count}× verknüpft
              </span>
            ),
          },
          {
            key: 'actions',
            label: '',
            width: 60,
            render: (p) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Muster "${p.name}" löschen?`)) deletePattern(p.id);
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
            icon={Layers}
            title="Noch keine Muster"
            description="Aus den ersten Fällen wirst du wiederkehrende Dynamiken erkennen. Halte sie hier fest."
            action={
              <button className="btn-primary" onClick={startCreate}>
                <Plus size={16} strokeWidth={2} /> Erstes Muster anlegen
              </button>
            }
          />
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? 'Muster bearbeiten' : 'Neues Muster'}
        width={680}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button className="btn-primary" onClick={save} disabled={!form.name.trim()}>
              Speichern
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Name" required>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              placeholder="z. B. Rückzug → Kontrolle → Eskalation"
            />
          </Field>
          <Field label="Beschreibung">
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
            />
          </Field>
          <Field label="Typische Symptome">
            <textarea
              className="input"
              rows={2}
              value={form.typicalSymptoms}
              onChange={(e) => set('typicalSymptoms')(e.target.value)}
            />
          </Field>
          <Field label="Typische Intervention">
            <textarea
              className="input"
              rows={2}
              value={form.typicalIntervention}
              onChange={(e) => set('typicalIntervention')(e.target.value)}
            />
          </Field>
          <Field label="Status">
            <div style={{ display: 'flex', gap: 8 }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status')(s)}
                  className={form.status === s ? 'btn-primary' : 'btn-ghost'}
                  style={{ fontSize: 12.5 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

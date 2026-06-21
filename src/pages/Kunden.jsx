import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useStore, SOURCE_OPTIONS } from '../store/StoreProvider.jsx';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/forms/Field.jsx';

function pluralize(n, sg, pl) {
  return `${n} ${n === 1 ? sg : pl}`;
}

export default function Kunden() {
  const { state, createCustomer, updateCustomer, deleteCustomer } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [source, setSource] = useState('');

  const counts = useMemo(() => {
    const cases = new Map();
    const revenue = new Map();
    for (const c of state.cases) {
      cases.set(c.customerId, (cases.get(c.customerId) ?? 0) + 1);
    }
    for (const r of state.revenue) {
      revenue.set(r.customerId, (revenue.get(r.customerId) ?? 0) + (Number(r.amount) || 0));
    }
    return { cases, revenue };
  }, [state.cases, state.revenue]);

  const rows = [...state.customers].sort((a, b) => b.number.localeCompare(a.number));

  const startCreate = () => {
    setEditingId(null);
    setSource('');
    setOpen(true);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setSource(c.source ?? '');
    setOpen(true);
  };

  const save = () => {
    if (editingId) updateCustomer(editingId, { source });
    else createCustomer({ source });
    setOpen(false);
    setSource('');
  };

  const close = () => {
    setOpen(false);
    setSource('');
    setEditingId(null);
  };

  const askDelete = (customer) => {
    const customerCases = state.cases.filter((c) => c.customerId === customer.id);
    const caseIds = new Set(customerCases.map((c) => c.id));
    const customerSessions = state.sessions.filter((s) => caseIds.has(s.caseId));
    const customerRevenue = state.revenue.filter((r) => r.customerId === customer.id);

    let msg = `Kunde ${customer.number} wirklich löschen?`;
    const parts = [];
    if (customerCases.length) parts.push(pluralize(customerCases.length, 'Fall', 'Fälle'));
    if (customerSessions.length)
      parts.push(pluralize(customerSessions.length, 'Session', 'Sessions'));
    if (customerRevenue.length)
      parts.push(pluralize(customerRevenue.length, 'Umsatzeintrag', 'Umsatzeinträge'));

    if (parts.length) {
      msg += `\n\nFolgende verknüpfte Datensätze werden ebenfalls gelöscht:\n• ${parts.join('\n• ')}`;
    }

    if (confirm(msg)) deleteCustomer(customer.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={startCreate}>
          <Plus size={16} strokeWidth={2} /> Neuer Kunde
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'number', label: 'Kunden-Nr.', width: 130 },
          { key: 'source', label: 'Herkunft', render: (r) => r.source || '–' },
          {
            key: 'cases',
            label: 'Fälle',
            width: 100,
            render: (r) => {
              const n = counts.cases.get(r.id) ?? 0;
              if (!n) return <span style={{ color: 'var(--muted)' }}>0</span>;
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/faelle?kunde=${r.id}`);
                  }}
                  style={{
                    color: 'var(--orange)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                  }}
                  title="Fälle dieses Kunden anzeigen"
                >
                  {n} ansehen
                </button>
              );
            },
          },
          {
            key: 'revenue',
            label: 'Umsatz (EUR)',
            width: 140,
            render: (r) =>
              new Intl.NumberFormat('de-DE').format(counts.revenue.get(r.id) ?? 0),
          },
          {
            key: 'actions',
            label: '',
            width: 60,
            render: (r) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  askDelete(r);
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
            icon={Users}
            title="Noch keine Kunden"
            description="Lege deinen ersten zahlenden Kunden an. Geführt nur über die Kundennummer."
            action={
              <button className="btn-primary" onClick={startCreate}>
                <Plus size={16} strokeWidth={2} /> Ersten Kunden anlegen
              </button>
            }
          />
        }
      />

      <Modal
        open={open}
        onClose={close}
        title={editingId ? 'Kunde bearbeiten' : 'Neuer Kunde'}
        footer={
          <>
            <button className="btn-ghost" onClick={close}>
              Abbrechen
            </button>
            <button className="btn-primary" onClick={save}>
              Speichern
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!editingId && (
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: 'rgba(255,155,38,0.08)',
                border: '1px solid rgba(255,155,38,0.2)',
                fontSize: 12.5,
                color: 'var(--text)',
              }}
            >
              Die Kundennummer wird automatisch vergeben (K001, K002, …). Es werden keine
              Klarnamen, E-Mails oder Telefonnummern gespeichert.
            </div>
          )}
          <Field label="Herkunft">
            <select
              className="input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">— bitte wählen —</option>
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

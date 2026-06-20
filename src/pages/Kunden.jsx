import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/forms/Field.jsx';
import ComboBox from '../components/forms/ComboBox.jsx';

export default function Kunden() {
  const { state, createCustomer, deleteCustomer } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={() => setOpen(true)}>
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
            width: 90,
            render: (r) => counts.cases.get(r.id) ?? 0,
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
                  if (confirm(`Kunde ${r.number} mit allen Fällen und Umsätzen löschen?`)) {
                    deleteCustomer(r.id);
                  }
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
        onRowClick={(r) => navigate(`/faelle?kunde=${r.id}`)}
        empty={
          <EmptyState
            icon={Users}
            title="Noch keine Kunden"
            description="Lege deinen ersten zahlenden Kunden an. Geführt nur über die Kundennummer."
            action={
              <button className="btn-primary" onClick={() => setOpen(true)}>
                <Plus size={16} strokeWidth={2} /> Ersten Kunden anlegen
              </button>
            }
          />
        }
      />

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setSource('');
        }}
        title="Neuer Kunde"
        footer={
          <>
            <button
              className="btn-ghost"
              onClick={() => {
                setOpen(false);
                setSource('');
              }}
            >
              Abbrechen
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                createCustomer({ source });
                setOpen(false);
                setSource('');
              }}
            >
              Anlegen
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          <Field label="Herkunft" hint="Auswählen oder neuen Wert eintippen.">
            <ComboBox
              value={source}
              onChange={setSource}
              options={state.vocab.sources}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

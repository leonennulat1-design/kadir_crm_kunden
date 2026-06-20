import { useMemo, useState } from 'react';
import { Euro, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { REVENUE_STAGES, formatEur, formatDate, stageLabel } from '../lib/format.js';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/forms/Field.jsx';

function emptyForm() {
  return {
    customerId: '',
    stage: REVENUE_STAGES[0].value,
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  };
}

export default function Umsatz() {
  const { state, createRevenue, deleteRevenue } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('all');

  const customerByNumber = useMemo(
    () => Object.fromEntries(state.customers.map((c) => [c.id, c.number])),
    [state.customers]
  );

  const totalsByStage = useMemo(() => {
    const t = {};
    for (const s of REVENUE_STAGES) t[s.value] = 0;
    for (const r of state.revenue) {
      const v = Number(r.amount) || 0;
      if (t[r.stage] != null) t[r.stage] += v;
    }
    return t;
  }, [state.revenue]);

  const total = Object.values(totalsByStage).reduce((a, b) => a + b, 0);

  const rows = useMemo(() => {
    const list = filter === 'all' ? state.revenue : state.revenue.filter((r) => r.stage === filter);
    return [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [state.revenue, filter]);

  const startCreate = () => {
    setForm(emptyForm());
    setOpen(true);
  };

  const save = () => {
    if (!form.customerId || !form.amount) return;
    createRevenue(form);
    setOpen(false);
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${REVENUE_STAGES.length + 1}, 1fr)`,
          gap: 12,
        }}
      >
        <SummaryCard label="Gesamt" amount={total} highlight />
        {REVENUE_STAGES.map((s) => (
          <SummaryCard key={s.value} label={s.label} amount={totalsByStage[s.value] ?? 0} />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            Alle
          </FilterChip>
          {REVENUE_STAGES.map((s) => (
            <FilterChip
              key={s.value}
              active={filter === s.value}
              onClick={() => setFilter(s.value)}
            >
              {s.label}
            </FilterChip>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={startCreate}
          disabled={!state.customers.length}
          style={{
            opacity: state.customers.length ? 1 : 0.5,
            cursor: state.customers.length ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={16} strokeWidth={2} /> Neuer Umsatz
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'date', label: 'Datum', width: 120, render: (r) => formatDate(r.date) },
          {
            key: 'customer',
            label: 'Kunde',
            width: 110,
            render: (r) => customerByNumber[r.customerId] ?? '–',
          },
          { key: 'stage', label: 'Stufe', render: (r) => stageLabel(r.stage) },
          {
            key: 'amount',
            label: 'Betrag',
            width: 140,
            render: (r) => (
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                {formatEur(r.amount)}
              </span>
            ),
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
                  if (confirm('Umsatzeintrag löschen?')) deleteRevenue(r.id);
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
          !state.customers.length ? (
            <EmptyState
              icon={Euro}
              title="Erst Kunden, dann Umsätze"
              description="Ein Umsatz wird immer einem Kunden zugeordnet."
            />
          ) : (
            <EmptyState
              icon={Euro}
              title={filter === 'all' ? 'Noch keine Umsätze' : 'Keine Umsätze in dieser Stufe'}
              description="Trag ein, was deine Kunden gezahlt haben."
              action={
                <button className="btn-primary" onClick={startCreate}>
                  <Plus size={16} strokeWidth={2} /> Ersten Umsatz erfassen
                </button>
              }
            />
          )
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Neuer Umsatz"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </button>
            <button
              className="btn-primary"
              onClick={save}
              disabled={!form.customerId || !form.amount}
            >
              Speichern
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Kunde" required style={{ gridColumn: 'span 2' }}>
            <select
              className="input"
              value={form.customerId}
              onChange={(e) => set('customerId')(e.target.value)}
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

          <Field label="Stufe" style={{ gridColumn: 'span 2' }}>
            <select
              className="input"
              value={form.stage}
              onChange={(e) => set('stage')(e.target.value)}
            >
              {REVENUE_STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Betrag (EUR)" required>
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              value={form.amount}
              onChange={(e) => set('amount')(e.target.value)}
            />
          </Field>

          <Field label="Datum">
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => set('date')(e.target.value)}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ label, amount, highlight }) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        background: highlight
          ? 'linear-gradient(135deg, rgba(255,155,38,0.18), rgba(238,76,39,0.12))'
          : 'var(--surface)',
        borderColor: highlight ? 'rgba(255,155,38,0.35)' : 'var(--border)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: highlight ? 'var(--orange)' : 'var(--muted)',
          marginBottom: 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '-0.02em',
        }}
      >
        {formatEur(amount)}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '7px 12px',
        borderRadius: 999,
        border: '1px solid var(--border)',
        background: active ? 'rgba(255,155,38,0.18)' : 'var(--surface-2)',
        color: active ? 'var(--orange)' : 'var(--text)',
        fontSize: 12.5,
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

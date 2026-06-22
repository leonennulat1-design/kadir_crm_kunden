import { useMemo, useState } from 'react';
import { Euro, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../store/StoreProvider.jsx';
import { REVENUE_STAGES, formatEur, formatDate, stageLabel } from '../lib/format.js';
import { pickFields } from '../lib/forms.js';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Field from '../components/forms/Field.jsx';
import { useConfirm } from '../components/ConfirmProvider.jsx';

const REVENUE_FIELDS = ['customerId', 'stage', 'amount', 'date'];

const MONTH_FMT = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  year: 'numeric',
});

function monthLabel(yyyyMm) {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (!y || !m) return yyyyMm;
  return MONTH_FMT.format(new Date(y, m - 1, 1));
}

// "Stufe 0" / "Stufe 1" für knappe Spalten, ohne den 90-Minuten-Zusatz.
function shortStageLabel(value) {
  const full = stageLabel(value);
  return full.split(' – ')[0];
}

function emptyForm() {
  return {
    customerId: '',
    stage: REVENUE_STAGES[0].value,
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  };
}

function fromRow(r) {
  return {
    customerId: r.customerId ?? '',
    stage: r.stage || REVENUE_STAGES[0].value,
    amount: r.amount?.toString() ?? '',
    date: r.date ?? '',
  };
}

export default function Umsatz() {
  const { state, createRevenue, updateRevenue, deleteRevenue } = useStore();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [stageFilter, setStageFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const customerByNumber = useMemo(
    () => Object.fromEntries(state.customers.map((c) => [c.id, c.number])),
    [state.customers]
  );

  // Alle Filter (Stufe + Zeitraum) wirken einheitlich auf Liste, Summen
  // und Monatsübersicht.
  const filteredRevenue = useMemo(() => {
    return state.revenue.filter((r) => {
      if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
      const d = r.date || '';
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [state.revenue, stageFilter, dateFrom, dateTo]);

  const totalsByStage = useMemo(() => {
    const t = {};
    for (const s of REVENUE_STAGES) t[s.value] = 0;
    for (const r of filteredRevenue) {
      const v = Number(r.amount) || 0;
      if (t[r.stage] != null) t[r.stage] += v;
    }
    return t;
  }, [filteredRevenue]);

  const total = Object.values(totalsByStage).reduce((a, b) => a + b, 0);

  const rows = useMemo(
    () =>
      [...filteredRevenue].sort((a, b) =>
        (b.date || '').localeCompare(a.date || '')
      ),
    [filteredRevenue]
  );

  const monthlyOverview = useMemo(() => {
    const grouped = new Map();
    for (const r of filteredRevenue) {
      const key = (r.date || '').slice(0, 7); // YYYY-MM
      if (!key) continue;
      if (!grouped.has(key)) {
        const entry = { id: key, total: 0 };
        for (const s of REVENUE_STAGES) entry[s.value] = 0;
        grouped.set(key, entry);
      }
      const entry = grouped.get(key);
      const v = Number(r.amount) || 0;
      if (entry[r.stage] != null) entry[r.stage] += v;
      entry.total += v;
    }
    return [...grouped.values()].sort((a, b) => b.id.localeCompare(a.id));
  }, [filteredRevenue]);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm(fromRow(r));
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditingId(null);
  };

  const canSave = !!form.customerId && form.amount !== '';

  const save = () => {
    if (!canSave) return;
    const patch = pickFields(form, REVENUE_FIELDS);
    if (editingId) updateRevenue(editingId, patch);
    else createRevenue(patch);
    close();
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const hasDateRange = dateFrom || dateTo;
  const clearDateRange = () => {
    setDateFrom('');
    setDateTo('');
  };

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
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <FilterChip active={stageFilter === 'all'} onClick={() => setStageFilter('all')}>
              Alle
            </FilterChip>
            {REVENUE_STAGES.map((s) => (
              <FilterChip
                key={s.value}
                active={stageFilter === s.value}
                onClick={() => setStageFilter(s.value)}
              >
                {s.label}
              </FilterChip>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                color: 'var(--muted)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Zeitraum
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Von"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 12.5,
                fontFamily: 'var(--font-body)',
                padding: '4px 2px',
              }}
            />
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>bis</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              aria-label="Bis"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 12.5,
                fontFamily: 'var(--font-body)',
                padding: '4px 2px',
              }}
            />
            {hasDateRange && (
              <button
                type="button"
                onClick={clearDateRange}
                aria-label="Zeitraum zurücksetzen"
                title="Zeitraum zurücksetzen"
                style={{
                  color: 'var(--muted)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 2,
                }}
              >
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </div>
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
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = await confirm({
                    title: 'Umsatzeintrag löschen?',
                    confirmLabel: 'Löschen',
                    danger: true,
                  });
                  if (ok) deleteRevenue(r.id);
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
          !state.customers.length ? (
            <EmptyState
              icon={Euro}
              title="Erst Kunden, dann Umsätze"
              description="Ein Umsatz wird immer einem Kunden zugeordnet."
            />
          ) : (
            <EmptyState
              icon={Euro}
              title={
                stageFilter !== 'all' || hasDateRange
                  ? 'Keine Umsätze für diese Filter'
                  : 'Noch keine Umsätze'
              }
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

      <MonthlyOverview entries={monthlyOverview} />

      <Modal
        open={open}
        onClose={close}
        title={editingId ? 'Umsatz bearbeiten' : 'Neuer Umsatz'}
        footer={
          <>
            <button className="btn-ghost" onClick={close}>
              Abbrechen
            </button>
            <button className="btn-primary" onClick={save} disabled={!canSave}>
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

          <Field label="Betrag (EUR)" required hint="0 ist erlaubt (z. B. Storno).">
            <input
              className="input"
              type="number"
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

function MonthlyOverview({ entries }) {
  if (!entries.length) return null;

  const cellStyle = {
    padding: '12px 18px',
    borderBottom: '1px solid var(--border)',
    fontSize: 13.5,
  };
  const headStyle = {
    ...cellStyle,
    textAlign: 'left',
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    fontSize: 11.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    whiteSpace: 'nowrap',
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.02em',
          }}
        >
          Monatsübersicht
        </h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headStyle}>Monat</th>
              {REVENUE_STAGES.map((s) => (
                <th key={s.value} style={{ ...headStyle, textAlign: 'right' }}>
                  {shortStageLabel(s.value)}
                </th>
              ))}
              <th style={{ ...headStyle, textAlign: 'right' }}>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((m, i) => {
              const isLast = i === entries.length - 1;
              const rowCell = isLast ? { ...cellStyle, borderBottom: 'none' } : cellStyle;
              return (
                <tr key={m.id}>
                  <td style={rowCell}>{monthLabel(m.id)}</td>
                  {REVENUE_STAGES.map((s) => (
                    <td
                      key={s.value}
                      style={{
                        ...rowCell,
                        textAlign: 'right',
                        color: m[s.value] ? 'var(--text)' : 'var(--muted)',
                      }}
                    >
                      {formatEur(m[s.value])}
                    </td>
                  ))}
                  <td
                    style={{
                      ...rowCell,
                      textAlign: 'right',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      color: 'var(--orange)',
                    }}
                  >
                    {formatEur(m.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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

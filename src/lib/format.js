const EUR = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const DATE = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatEur(value) {
  if (value == null || value === '') return '–';
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '–';
  return EUR.format(n);
}

export function formatDate(value) {
  if (!value) return '–';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '–';
  return DATE.format(d);
}

export const STAGES = [
  { value: 'stufe_0', label: 'Stufe 0 – 90-Minuten-Session' },
  { value: 'stufe_1_session', label: 'Stufe 1 – Wochen-Call (6-Wochen-Programm)' },
  { value: 'stufe_1_program', label: 'Stufe 1 – 6-Wochen-Begleitung' },
];

export const SESSION_TYPES = STAGES.filter((s) => s.value !== 'stufe_1_program');
export const REVENUE_STAGES = STAGES.filter((s) => s.value !== 'stufe_1_session');

export function stageLabel(value) {
  return STAGES.find((s) => s.value === value)?.label ?? value ?? '–';
}

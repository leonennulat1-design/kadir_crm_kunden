export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatNumber(prefix, n) {
  return `${prefix}${String(n).padStart(3, '0')}`;
}

export function nextNumber(items, key) {
  const max = items.reduce((m, item) => {
    const v = item[key];
    if (typeof v !== 'string') return m;
    const n = parseInt(v.slice(1), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return max + 1;
}

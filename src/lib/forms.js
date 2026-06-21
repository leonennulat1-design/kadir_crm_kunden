export function pickFields(obj, fields) {
  const out = {};
  for (const f of fields) out[f] = obj[f];
  return out;
}

export function pluralize(n, sg, pl) {
  return `${n} ${n === 1 ? sg : pl}`;
}

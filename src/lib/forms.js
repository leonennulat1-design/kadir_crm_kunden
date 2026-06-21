export function pickFields(obj, fields) {
  const out = {};
  for (const f of fields) out[f] = obj[f];
  return out;
}

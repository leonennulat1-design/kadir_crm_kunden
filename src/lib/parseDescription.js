export const DESCRIPTION_LABELS = [
  { label: 'INTERVENTION:', field: 'intervention' },
  { label: 'AHA-MOMENT:', field: 'ahaMoment' },
  { label: 'ERGEBNIS:', field: 'result' },
  { label: 'NÄCHSTER SCHRITT:', field: 'nextStep' },
  { label: 'CONTENT-IDEE:', field: 'contentIdea' },
];

function matchLabel(line) {
  const trimmed = line.trimStart().toLowerCase();
  for (const { label, field } of DESCRIPTION_LABELS) {
    if (trimmed.startsWith(label.toLowerCase())) {
      const idx = line.toLowerCase().indexOf(label.toLowerCase());
      const rest = line.slice(idx + label.length).trim();
      return { field, rest };
    }
  }
  return null;
}

export function parseDescription(text) {
  const sections = { description: [] };
  let current = 'description';
  for (const line of (text ?? '').split('\n')) {
    const m = matchLabel(line);
    if (m) {
      current = m.field;
      sections[current] = sections[current] || [];
      if (m.rest) sections[current].push(m.rest);
    } else {
      sections[current] = sections[current] || [];
      sections[current].push(line);
    }
  }
  const out = {};
  for (const key of Object.keys(sections)) {
    out[key] = sections[key].join('\n').trim();
  }
  return out;
}

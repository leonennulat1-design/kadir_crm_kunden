export const DESCRIPTION_LABELS = [
  { label: 'INTERVENTION:', field: 'intervention' },
  { label: 'AHA-MOMENT:', field: 'ahaMoment' },
  { label: 'ERGEBNIS:', field: 'result' },
  { label: 'NÄCHSTER SCHRITT:', field: 'nextStep' },
  { label: 'CONTENT-IDEE:', field: 'contentIdea' },
];

export const CASE_DESCRIPTION_LABELS = [
  { label: 'BEZIEHUNGSFELD:', field: 'relationshipType' },
  { label: 'SYMPTOM:', field: 'symptom' },
  { label: 'AUSLÖSER:', field: 'trigger' },
  { label: 'KONFLIKTTHEMA:', field: 'conflictTopic' },
  { label: 'DYNAMIK:', field: 'dynamic' },
  { label: 'SCHUTZMUSTER:', field: 'protectionPattern' },
  { label: 'BEDÜRFNIS:', field: 'need' },
  { label: 'THEMEN:', field: 'linkedTopics' },
];

function matchLabelFrom(line, labels) {
  const trimmed = line.trimStart().toLowerCase();
  for (const { label, field } of labels) {
    if (trimmed.startsWith(label.toLowerCase())) {
      const idx = line.toLowerCase().indexOf(label.toLowerCase());
      const rest = line.slice(idx + label.length).trim();
      return { field, rest };
    }
  }
  return null;
}

export function parseLabeledText(text, labels) {
  const sections = { description: [] };
  let current = 'description';
  for (const line of (text ?? '').split('\n')) {
    const m = matchLabelFrom(line, labels);
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

export function parseDescription(text) {
  return parseLabeledText(text, DESCRIPTION_LABELS);
}

export function parseCaseDescription(text) {
  const parsed = parseLabeledText(text, CASE_DESCRIPTION_LABELS);
  const topicsRaw = parsed.linkedTopics ?? '';
  parsed.linkedTopics = topicsRaw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parsed;
}

import { useMemo, useState } from 'react';
import { BarChart3, Copy, Download, Check } from 'lucide-react';
import { useStore, usePatternUsage } from '../store/StoreProvider.jsx';
import { REVENUE_STAGES, formatEur, stageLabel } from '../lib/format.js';

function topCounts(items, key, limit = 10) {
  const counts = new Map();
  for (const item of items) {
    const v = (item[key] ?? '').trim();
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function topMultiCounts(items, key, limit = 10) {
  const counts = new Map();
  for (const item of items) {
    for (const v of item[key] ?? []) {
      const val = (v ?? '').trim();
      if (!val) continue;
      counts.set(val, (counts.get(val) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function buildMarkdown(state, usage) {
  const lines = [];
  const customerByNum = Object.fromEntries(state.customers.map((c) => [c.id, c.number]));
  const caseByNum = Object.fromEntries(state.cases.map((c) => [c.id, c.number]));
  const patternByName = Object.fromEntries(state.patterns.map((p) => [p.id, p.name]));

  lines.push(`# Kadir CRM – Export`);
  lines.push(`Stand: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(
    `Gesamtzahlen: ${state.customers.length} Kunden, ${state.cases.length} Fälle, ${state.sessions.length} Sessions, ${state.patterns.length} Muster.`
  );
  lines.push('');

  lines.push('## Kunden');
  if (!state.customers.length) lines.push('_Keine Einträge._');
  for (const c of state.customers) {
    lines.push(`- **${c.number}** – Herkunft: ${c.source || '–'}`);
  }
  lines.push('');

  lines.push('## Fälle');
  if (!state.cases.length) lines.push('_Keine Einträge._');
  for (const c of state.cases) {
    const patterns = (c.linkedPatterns ?? [])
      .map((id) => patternByName[id])
      .filter(Boolean);
    lines.push(`### ${c.number} (Kunde ${customerByNum[c.customerId] ?? '–'})`);
    lines.push(`- Beziehung: ${c.relationshipType || '–'}`);
    lines.push(`- Symptom: ${c.symptom || '–'}`);
    lines.push(`- Auslöser: ${c.trigger || '–'}`);
    lines.push(`- Konfliktthema: ${c.conflictTopic || '–'}`);
    lines.push(`- Dynamik: ${c.dynamic || '–'}`);
    lines.push(`- Schutzmuster: ${c.protectionPattern || '–'}`);
    lines.push(`- Bedürfnis: ${c.need || '–'}`);
    lines.push(`- Themen: ${(c.linkedTopics ?? []).join(', ') || '–'}`);
    lines.push(`- Verknüpfte Muster: ${patterns.join(', ') || '–'}`);
    lines.push('');
  }

  lines.push('## Sessions');
  if (!state.sessions.length) lines.push('_Keine Einträge._');
  for (const s of state.sessions) {
    lines.push(`### Session zu Fall ${caseByNum[s.caseId] ?? '–'} am ${s.date || '–'}`);
    lines.push(`- Typ: ${s.type || '–'}`);
    if (s.description) {
      lines.push(`- Beschreibung:`);
      lines.push(`  > ${s.description.replace(/\n/g, '\n  > ')}`);
    }
    lines.push(`- Intervention: ${s.intervention || '–'}`);
    lines.push(`- Aha-Moment: ${s.ahaMoment || '–'}`);
    lines.push(`- Ergebnis: ${s.result || '–'}`);
    lines.push(`- Nächster Schritt: ${s.nextStep || '–'}`);
    lines.push(`- Nächster Kontaktpunkt: ${s.nextContact || '–'}`);
    lines.push(`- Content-Idee: ${s.contentIdea || '–'}`);
    if (s.contentAngle) lines.push(`- Content-Winkel: ${s.contentAngle}`);
    if (s.contentStatus) lines.push(`- Content-Status: ${s.contentStatus}`);
    lines.push(`- Einverständnis: ${s.consentGiven ? 'ja' : 'nein'}`);
    if (s.transcript) {
      lines.push(`- Transkript (anonymisiert):`);
      lines.push(`  > ${s.transcript.replace(/\n/g, '\n  > ')}`);
    }
    lines.push('');
  }

  lines.push('## Muster');
  if (!state.patterns.length) lines.push('_Keine Einträge._');
  for (const p of state.patterns) {
    lines.push(`### ${p.number} – ${p.name}`);
    lines.push(`- Status: ${p.status}`);
    lines.push(`- Häufigkeit: ${usage.get(p.id) ?? 0}× in Fällen verknüpft`);
    lines.push(`- Beschreibung: ${p.description || '–'}`);
    lines.push(`- Typische Symptome: ${p.typicalSymptoms || '–'}`);
    lines.push(`- Typische Intervention: ${p.typicalIntervention || '–'}`);
    lines.push('');
  }

  return lines.join('\n');
}

export default function Auswertung() {
  const { state } = useStore();
  const usage = usePatternUsage();
  const [copied, setCopied] = useState(false);

  const topPatterns = useMemo(() => {
    return [...state.patterns]
      .map((p) => [p.name, usage.get(p.id) ?? 0])
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [state.patterns, usage]);

  const topRelationships = useMemo(() => topCounts(state.cases, 'relationshipType'), [state.cases]);
  const topNeeds = useMemo(() => topCounts(state.cases, 'need'), [state.cases]);
  const topTopics = useMemo(() => topMultiCounts(state.cases, 'linkedTopics'), [state.cases]);

  const totalsByStage = useMemo(() => {
    const t = {};
    for (const s of REVENUE_STAGES) t[s.value] = 0;
    for (const r of state.revenue) {
      const v = Number(r.amount) || 0;
      if (t[r.stage] != null) t[r.stage] += v;
    }
    return t;
  }, [state.revenue]);

  const markdown = useMemo(() => buildMarkdown(state, usage), [state, usage]);

  const PREVIEW_LINES = 200;
  const preview = useMemo(() => {
    const lines = markdown.split('\n');
    if (lines.length <= PREVIEW_LINES) return { text: markdown, truncated: 0 };
    return {
      text:
        lines.slice(0, PREVIEW_LINES).join('\n') +
        `\n\n… ${lines.length - PREVIEW_LINES} weitere Zeilen — vollständig im Download.`,
      truncated: lines.length - PREVIEW_LINES,
    };
  }, [markdown]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = markdown;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kadir-crm-export-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: 12,
          }}
        >
          Kennzahlen
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          <CountCard label="Kunden" value={state.customers.length} />
          <CountCard label="Fälle" value={state.cases.length} />
          <CountCard label="Sessions" value={state.sessions.length} />
          <CountCard label="Muster" value={state.patterns.length} />
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        <RankCard title="Häufigste Muster" entries={topPatterns} unit="×" />
        <RankCard title="Häufigste Beziehungen" entries={topRelationships} unit="×" />
        <RankCard title="Häufigste Bedürfnisse" entries={topNeeds} unit="×" />
        <RankCard title="Häufigste Themen" entries={topTopics} unit="×" />
      </section>

      <section className="card">
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Umsatz nach Stufe</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REVENUE_STAGES.map((s) => (
            <div
              key={s.value}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 8,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                fontSize: 13,
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{stageLabel(s.value)}</span>
              <strong style={{ fontFamily: 'var(--font-heading)' }}>
                {formatEur(totalsByStage[s.value] ?? 0)}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <BarChart3 size={17} strokeWidth={1.75} color="var(--orange)" />
              Export für KI-Auswertung
            </h2>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              Erzeugt einen einzigen Markdown-Text mit ALLEN Daten (Kundennummern, alle Fall-Felder,
              alle Session-Felder inkl. Beschreibung und Transkript, alle Muster mit Häufigkeit).
              Kopier ihn in deine externe KI oder lade ihn als Datei herunter.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" onClick={copy}>
              {copied ? (
                <>
                  <Check size={14} strokeWidth={2} /> Kopiert
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={1.75} /> Kopieren
                </>
              )}
            </button>
            <button className="btn-primary" onClick={download}>
              <Download size={14} strokeWidth={2} /> Als .md speichern
            </button>
          </div>
        </div>
        <pre
          style={{
            maxHeight: 320,
            overflow: 'auto',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11.5,
            color: 'var(--muted)',
            whiteSpace: 'pre-wrap',
            margin: 0,
          }}
        >
          {preview.text}
        </pre>
      </section>
    </div>
  );
}

function CountCard({ label, value }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function RankCard({ title, entries, unit }) {
  return (
    <div className="card">
      <h3
        style={{
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '0.02em',
          marginBottom: 10,
        }}
      >
        {title}
      </h3>
      {!entries.length ? (
        <div style={{ color: 'var(--muted)', fontSize: 12.5, padding: '4px 0' }}>
          Noch keine Daten.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {entries.map(([name, count]) => (
            <div
              key={name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                gap: 8,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
              <span
                style={{
                  color: 'var(--orange)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {count}
                {unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

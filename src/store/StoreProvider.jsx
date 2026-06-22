import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { uid, formatNumber, nextNumber } from '../lib/ids.js';
import { supabase, formatSupabaseError } from '../lib/supabase.js';
import SplashScreen from '../components/SplashScreen.jsx';

export const SOURCE_OPTIONS = [
  'Netzwerk',
  'Social Media',
  'Bestandskunde: HM-Coaching',
];

const EMPTY_STATE = {
  lastBackupAt: null,
  customers: [],
  cases: [],
  sessions: [],
  patterns: [],
  revenue: [],
  feedback: [],
  vocab: {
    sources: [],
    relationships: [],
    protectionPatterns: [],
    needs: [],
    topics: [],
  },
};

function groupVocab(rows) {
  const out = { sources: [], relationships: [], protectionPatterns: [], needs: [], topics: [] };
  for (const row of rows ?? []) {
    const cat = row.category;
    if (!out[cat]) out[cat] = [];
    out[cat].push(row.value);
  }
  return out;
}

async function loadAll() {
  const [customers, cases, sessions, patterns, revenue, feedback, vocab, appState] =
    await Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('cases').select('*'),
      supabase.from('sessions').select('*'),
      supabase.from('patterns').select('*'),
      supabase.from('revenue').select('*'),
      supabase.from('feedback').select('*'),
      supabase.from('vocab').select('*'),
      supabase.from('app_state').select('*').eq('id', 1).maybeSingle(),
    ]);

  for (const r of [customers, cases, sessions, patterns, revenue, feedback, vocab, appState]) {
    if (r.error) throw r.error;
  }

  return {
    customers: customers.data ?? [],
    cases: (cases.data ?? []).map((c) => ({
      ...c,
      linkedPatterns: c.linkedPatterns ?? [],
      linkedTopics: c.linkedTopics ?? [],
    })),
    sessions: sessions.data ?? [],
    patterns: patterns.data ?? [],
    revenue: revenue.data ?? [],
    feedback: feedback.data ?? [],
    vocab: groupVocab(vocab.data),
    lastBackupAt: appState.data?.lastBackupAt ?? null,
  };
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadAll();
        if (cancelled) return;
        setState(data);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setLoadError(formatSupabaseError(e));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Eine Mutation läuft so: lokal vorab anwenden, dann an Supabase senden.
  // Bei Fehler kippt der Banner — die UI bleibt benutzbar, der User weiß,
  // dass die letzte Änderung beim nächsten Reload möglicherweise fehlt.
  const runRemote = useCallback(async (op, contextLabel) => {
    try {
      const result = await op();
      if (result?.error) throw result.error;
      setSaveError((curr) => (curr === null ? curr : null));
      return result;
    } catch (e) {
      const msg = `${contextLabel}: ${formatSupabaseError(e)}`;
      console.error('[CRM] Supabase-Fehler:', e);
      setSaveError((curr) => (curr === msg ? curr : msg));
      return { error: e };
    }
  }, []);

  const addVocab = useCallback(
    async (category, value) => {
      const trimmed = (value ?? '').trim();
      if (!trimmed) return;
      let alreadyKnown = false;
      setState((s) => {
        const list = s.vocab[category] ?? [];
        if (list.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
          alreadyKnown = true;
          return s;
        }
        return { ...s, vocab: { ...s.vocab, [category]: [...list, trimmed] } };
      });
      if (alreadyKnown) return;
      // upsert mit ignoreDuplicates: paralleler addVocab-Lauf oder bereits
      // vom anderen User angelegter Wert darf den Speichervorgang nicht
      // mit einem Unique-Constraint-Fehler abbrechen.
      await runRemote(
        () =>
          supabase
            .from('vocab')
            .upsert(
              { category, value: trimmed },
              { onConflict: 'category,value', ignoreDuplicates: true }
            ),
        'Vokabular speichern'
      );
    },
    [runRemote]
  );

  const api = useMemo(() => {
    const addVocabMany = (category, values) =>
      Promise.all((values ?? []).filter(Boolean).map((v) => addVocab(category, v)));

    return {
      state,
      saveError,
      clearSaveError: () => setSaveError(null),

      async createCustomer({ source }) {
        const id = uid();
        const safeSource = SOURCE_OPTIONS.includes(source) ? source : '';
        const number = formatNumber('K', nextNumber(state.customers, 'number'));
        const row = { id, number, source: safeSource };
        setState((s) => ({ ...s, customers: [...s.customers, row] }));
        await runRemote(() => supabase.from('customers').insert(row), 'Kunde anlegen');
        return id;
      },

      async updateCustomer(id, patch) {
        const safePatch = { ...patch };
        if ('source' in safePatch) {
          safePatch.source = SOURCE_OPTIONS.includes(safePatch.source) ? safePatch.source : '';
        }
        setState((s) => ({
          ...s,
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...safePatch } : c)),
        }));
        await runRemote(
          () => supabase.from('customers').update(safePatch).eq('id', id),
          'Kunde aktualisieren'
        );
      },

      async deleteCustomer(id) {
        // ON DELETE CASCADE in der DB räumt FKs auf — lokal ziehen wir
        // dieselbe Linie, damit der State nicht auf verwaiste IDs zeigt.
        setState((s) => {
          const removedCaseIds = s.cases.filter((c) => c.customerId === id).map((c) => c.id);
          return {
            ...s,
            customers: s.customers.filter((c) => c.id !== id),
            cases: s.cases.filter((c) => c.customerId !== id),
            sessions: s.sessions.filter((sess) => !removedCaseIds.includes(sess.caseId)),
            revenue: s.revenue.filter((r) => r.customerId !== id),
          };
        });
        await runRemote(
          () => supabase.from('customers').delete().eq('id', id),
          'Kunde löschen'
        );
      },

      async createCase(payload) {
        const id = uid();
        const number = formatNumber('F', nextNumber(state.cases, 'number'));
        const row = {
          id,
          number,
          customerId: payload.customerId,
          description: payload.description ?? '',
          relationshipType: payload.relationshipType ?? '',
          symptom: payload.symptom ?? '',
          trigger: payload.trigger ?? '',
          conflictTopic: payload.conflictTopic ?? '',
          dynamic: payload.dynamic ?? '',
          protectionPattern: payload.protectionPattern ?? '',
          need: payload.need ?? '',
          linkedPatterns: payload.linkedPatterns ?? [],
          linkedTopics: payload.linkedTopics ?? [],
        };
        setState((s) => ({ ...s, cases: [...s.cases, row] }));
        await runRemote(() => supabase.from('cases').insert(row), 'Fall anlegen');
        addVocab('relationships', payload.relationshipType);
        addVocab('protectionPatterns', payload.protectionPattern);
        addVocab('needs', payload.need);
        addVocabMany('topics', payload.linkedTopics ?? []);
        return id;
      },

      async updateCase(id, patch) {
        setState((s) => ({
          ...s,
          cases: s.cases.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
        await runRemote(
          () => supabase.from('cases').update(patch).eq('id', id),
          'Fall aktualisieren'
        );
        if (patch.relationshipType) addVocab('relationships', patch.relationshipType);
        if (patch.protectionPattern) addVocab('protectionPatterns', patch.protectionPattern);
        if (patch.need) addVocab('needs', patch.need);
        if (patch.linkedTopics) addVocabMany('topics', patch.linkedTopics);
      },

      async deleteCase(id) {
        setState((s) => ({
          ...s,
          cases: s.cases.filter((c) => c.id !== id),
          sessions: s.sessions.filter((sess) => sess.caseId !== id),
        }));
        await runRemote(() => supabase.from('cases').delete().eq('id', id), 'Fall löschen');
      },

      async createSession(payload) {
        if (!payload.consentGiven) {
          throw new Error('Einverständnis fehlt');
        }
        const id = uid();
        const row = {
          id,
          caseId: payload.caseId,
          date: payload.date || null,
          type: payload.type ?? '',
          description: payload.description ?? '',
          intervention: payload.intervention ?? '',
          ahaMoment: payload.ahaMoment ?? '',
          result: payload.result ?? '',
          nextStep: payload.nextStep ?? '',
          nextContact: payload.nextContact || null,
          transcript: payload.transcript ?? '',
          consentGiven: true,
          contentIdea: payload.contentIdea ?? '',
          contentAngle: payload.contentAngle ?? '',
          contentStatus: payload.contentStatus ?? 'Idee',
        };
        setState((s) => ({ ...s, sessions: [...s.sessions, row] }));
        await runRemote(() => supabase.from('sessions').insert(row), 'Session anlegen');
        return id;
      },

      async updateSession(id, patch) {
        if (patch.consentGiven === false) {
          throw new Error('Einverständnis darf nicht entfernt werden.');
        }
        const cleaned = { ...patch };
        if ('date' in cleaned) cleaned.date = cleaned.date || null;
        if ('nextContact' in cleaned) cleaned.nextContact = cleaned.nextContact || null;
        setState((s) => ({
          ...s,
          sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }));
        await runRemote(
          () => supabase.from('sessions').update(cleaned).eq('id', id),
          'Session aktualisieren'
        );
      },

      async deleteSession(id) {
        setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
        await runRemote(
          () => supabase.from('sessions').delete().eq('id', id),
          'Session löschen'
        );
      },

      async createPattern(payload) {
        const id = uid();
        const number = formatNumber('M', nextNumber(state.patterns, 'number'));
        const row = {
          id,
          number,
          name: payload.name ?? '',
          description: payload.description ?? '',
          typicalSymptoms: payload.typicalSymptoms ?? '',
          typicalIntervention: payload.typicalIntervention ?? '',
          status: payload.status ?? 'Hypothese',
        };
        setState((s) => ({ ...s, patterns: [...s.patterns, row] }));
        await runRemote(() => supabase.from('patterns').insert(row), 'Muster anlegen');
        return id;
      },

      async updatePattern(id, patch) {
        setState((s) => ({
          ...s,
          patterns: s.patterns.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
        await runRemote(
          () => supabase.from('patterns').update(patch).eq('id', id),
          'Muster aktualisieren'
        );
      },

      async deletePattern(id) {
        // 1) lokale Verknüpfungen entfernen
        const affectedCases = state.cases.filter((c) => (c.linkedPatterns ?? []).includes(id));
        setState((s) => ({
          ...s,
          patterns: s.patterns.filter((p) => p.id !== id),
          cases: s.cases.map((c) => ({
            ...c,
            linkedPatterns: (c.linkedPatterns ?? []).filter((pid) => pid !== id),
          })),
        }));

        // 2) Verknüpfungen in der DB aus betroffenen Fällen entfernen
        for (const c of affectedCases) {
          const nextLinked = (c.linkedPatterns ?? []).filter((pid) => pid !== id);
          await runRemote(
            () => supabase.from('cases').update({ linkedPatterns: nextLinked }).eq('id', c.id),
            'Muster-Verknüpfung entfernen'
          );
        }

        // 3) Muster löschen
        await runRemote(
          () => supabase.from('patterns').delete().eq('id', id),
          'Muster löschen'
        );
      },

      async createRevenue(payload) {
        const id = uid();
        const row = {
          id,
          customerId: payload.customerId,
          stage: payload.stage ?? '',
          amount: Number(payload.amount) || 0,
          date: payload.date || null,
        };
        setState((s) => ({ ...s, revenue: [...s.revenue, row] }));
        await runRemote(() => supabase.from('revenue').insert(row), 'Umsatz anlegen');
        return id;
      },

      async updateRevenue(id, patch) {
        const cleaned = { ...patch };
        if ('amount' in cleaned) cleaned.amount = Number(cleaned.amount) || 0;
        if ('date' in cleaned) cleaned.date = cleaned.date || null;
        setState((s) => ({
          ...s,
          revenue: s.revenue.map((r) => (r.id === id ? { ...r, ...cleaned } : r)),
        }));
        await runRemote(
          () => supabase.from('revenue').update(cleaned).eq('id', id),
          'Umsatz aktualisieren'
        );
      },

      async deleteRevenue(id) {
        setState((s) => ({ ...s, revenue: s.revenue.filter((r) => r.id !== id) }));
        await runRemote(
          () => supabase.from('revenue').delete().eq('id', id),
          'Umsatz löschen'
        );
      },

      async createFeedback({ text, page }) {
        const trimmed = text?.trim();
        if (!trimmed) return null;
        const id = uid();
        const createdAt = new Date().toISOString();
        const row = { id, text: trimmed, page: page ?? '', createdAt };
        setState((s) => ({ ...s, feedback: [...s.feedback, row] }));
        await runRemote(() => supabase.from('feedback').insert(row), 'Feedback speichern');
        return id;
      },

      async deleteFeedback(id) {
        setState((s) => ({ ...s, feedback: s.feedback.filter((f) => f.id !== id) }));
        await runRemote(
          () => supabase.from('feedback').delete().eq('id', id),
          'Feedback löschen'
        );
      },

      async markBackupTaken() {
        const ts = new Date().toISOString();
        setState((s) => ({ ...s, lastBackupAt: ts }));
        await runRemote(
          () => supabase.from('app_state').update({ lastBackupAt: ts }).eq('id', 1),
          'Backup-Zeitstempel speichern'
        );
      },

      // Daten neu von Supabase ziehen, damit der zweite User Änderungen sieht
      async reload() {
        try {
          const data = await loadAll();
          setState(data);
          setSaveError(null);
        } catch (e) {
          setSaveError(formatSupabaseError(e));
        }
      },

      addVocab,
    };
  }, [state, saveError, runRemote, addVocab]);

  if (loading) return <SplashScreen text="Daten laden…" />;
  if (loadError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div
          className="card"
          style={{ padding: 32, maxWidth: 480, textAlign: 'center' }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Daten konnten nicht geladen werden
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>
            {loadError}
          </p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
            style={{ justifyContent: 'center' }}
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function usePatternUsage() {
  const { state } = useStore();
  return useMemo(() => {
    const counts = new Map();
    for (const c of state.cases) {
      for (const pid of c.linkedPatterns ?? []) {
        counts.set(pid, (counts.get(pid) ?? 0) + 1);
      }
    }
    return counts;
  }, [state.cases]);
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { uid, formatNumber, nextNumber } from '../lib/ids.js';

const STORAGE_KEY = 'kadir-crm';
const CURRENT_VERSION = 1;

const INITIAL_STATE = {
  version: CURRENT_VERSION,
  customers: [],
  cases: [],
  sessions: [],
  patterns: [],
  revenue: [],
  vocab: {
    sources: ['Netzwerk', 'Social Media', 'Sonstiges'],
    relationships: [
      'Partnerschaft',
      'Familie',
      'Eltern-Kind',
      'Mensch-Hund',
      'Führung/Beruf',
      'Team',
      'Freundschaft',
      'Innerer Konflikt',
      'Sonstiges',
    ],
    protectionPatterns: [
      'Rückzug',
      'Kontrolle',
      'Anpassung',
      'Angriff',
      'Rechtfertigung',
      'Retten',
    ],
    needs: [],
    topics: [],
  },
};

function migrate(raw) {
  if (!raw || typeof raw !== 'object') return INITIAL_STATE;
  let data = { ...INITIAL_STATE, ...raw };
  data.vocab = { ...INITIAL_STATE.vocab, ...(raw.vocab ?? {}) };
  for (const k of Object.keys(INITIAL_STATE.vocab)) {
    if (!Array.isArray(data.vocab[k])) data.vocab[k] = [...INITIAL_STATE.vocab[k]];
  }
  for (const k of ['customers', 'cases', 'sessions', 'patterns', 'revenue']) {
    if (!Array.isArray(data[k])) data[k] = [];
  }
  data.version = CURRENT_VERSION;
  return data;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return migrate(JSON.parse(raw));
  } catch {
    return INITIAL_STATE;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const api = useMemo(() => {
    const addVocab = (key, value) => {
      if (!value) return;
      setState((s) => {
        const list = s.vocab[key] ?? [];
        if (list.some((v) => v.toLowerCase() === value.toLowerCase())) return s;
        return { ...s, vocab: { ...s.vocab, [key]: [...list, value] } };
      });
    };

    const addVocabMany = (key, values) => {
      values.filter(Boolean).forEach((v) => addVocab(key, v));
    };

    return {
      state,

      createCustomer({ source }) {
        const id = uid();
        setState((s) => {
          const number = formatNumber('K', nextNumber(s.customers, 'number'));
          return { ...s, customers: [...s.customers, { id, number, source }] };
        });
        if (source) addVocab('sources', source);
        return id;
      },

      updateCustomer(id, patch) {
        setState((s) => ({
          ...s,
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
        if (patch.source) addVocab('sources', patch.source);
      },

      deleteCustomer(id) {
        setState((s) => ({
          ...s,
          customers: s.customers.filter((c) => c.id !== id),
          cases: s.cases.filter((c) => c.customerId !== id),
          revenue: s.revenue.filter((r) => r.customerId !== id),
        }));
      },

      createCase(payload) {
        const id = uid();
        setState((s) => {
          const number = formatNumber('F', nextNumber(s.cases, 'number'));
          return {
            ...s,
            cases: [
              ...s.cases,
              {
                id,
                number,
                customerId: payload.customerId,
                relationshipType: payload.relationshipType ?? '',
                symptom: payload.symptom ?? '',
                trigger: payload.trigger ?? '',
                conflictTopic: payload.conflictTopic ?? '',
                dynamic: payload.dynamic ?? '',
                protectionPattern: payload.protectionPattern ?? '',
                need: payload.need ?? '',
                linkedPatterns: payload.linkedPatterns ?? [],
                linkedTopics: payload.linkedTopics ?? [],
              },
            ],
          };
        });
        addVocab('relationships', payload.relationshipType);
        addVocab('protectionPatterns', payload.protectionPattern);
        addVocab('needs', payload.need);
        addVocabMany('topics', payload.linkedTopics ?? []);
        return id;
      },

      updateCase(id, patch) {
        setState((s) => ({
          ...s,
          cases: s.cases.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
        if (patch.relationshipType) addVocab('relationships', patch.relationshipType);
        if (patch.protectionPattern) addVocab('protectionPatterns', patch.protectionPattern);
        if (patch.need) addVocab('needs', patch.need);
        if (patch.linkedTopics) addVocabMany('topics', patch.linkedTopics);
      },

      deleteCase(id) {
        setState((s) => ({
          ...s,
          cases: s.cases.filter((c) => c.id !== id),
          sessions: s.sessions.filter((sess) => sess.caseId !== id),
        }));
      },

      createSession(payload) {
        if (!payload.consentGiven) {
          throw new Error('Einverständnis fehlt');
        }
        const id = uid();
        setState((s) => ({
          ...s,
          sessions: [
            ...s.sessions,
            {
              id,
              caseId: payload.caseId,
              date: payload.date ?? '',
              type: payload.type ?? '',
              intervention: payload.intervention ?? '',
              ahaMoment: payload.ahaMoment ?? '',
              result: payload.result ?? '',
              nextStep: payload.nextStep ?? '',
              nextContact: payload.nextContact ?? '',
              recordingLink: payload.recordingLink ?? '',
              consentGiven: true,
              contentIdea: payload.contentIdea ?? '',
            },
          ],
        }));
        return id;
      },

      deleteSession(id) {
        setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
      },

      createPattern(payload) {
        const id = uid();
        setState((s) => {
          const number = formatNumber('M', nextNumber(s.patterns, 'number'));
          return {
            ...s,
            patterns: [
              ...s.patterns,
              {
                id,
                number,
                name: payload.name ?? '',
                description: payload.description ?? '',
                typicalSymptoms: payload.typicalSymptoms ?? '',
                typicalIntervention: payload.typicalIntervention ?? '',
                status: payload.status ?? 'Hypothese',
              },
            ],
          };
        });
        return id;
      },

      updatePattern(id, patch) {
        setState((s) => ({
          ...s,
          patterns: s.patterns.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
      },

      deletePattern(id) {
        setState((s) => ({
          ...s,
          patterns: s.patterns.filter((p) => p.id !== id),
          cases: s.cases.map((c) => ({
            ...c,
            linkedPatterns: (c.linkedPatterns ?? []).filter((pid) => pid !== id),
          })),
        }));
      },

      createRevenue(payload) {
        const id = uid();
        setState((s) => ({
          ...s,
          revenue: [
            ...s.revenue,
            {
              id,
              customerId: payload.customerId,
              stage: payload.stage,
              amount: Number(payload.amount) || 0,
              date: payload.date ?? '',
            },
          ],
        }));
        return id;
      },

      deleteRevenue(id) {
        setState((s) => ({ ...s, revenue: s.revenue.filter((r) => r.id !== id) }));
      },

      addVocab,
    };
  }, [state]);

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

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { uid, formatNumber, nextNumber } from '../lib/ids.js';

const STORAGE_KEY = 'kadir-crm';
const CURRENT_VERSION = 5;

export const SOURCE_OPTIONS = [
  'Netzwerk',
  'Social Media',
  'Bestandskunde: HM-Coaching',
];

const INITIAL_STATE = {
  version: CURRENT_VERSION,
  lastBackupAt: null,
  customers: [],
  cases: [],
  sessions: [],
  patterns: [],
  revenue: [],
  feedback: [],
  vocab: {
    sources: [...SOURCE_OPTIONS],
    relationships: [
      'Partnerschaft',
      'Familie',
      'Eltern-Kind',
      'Mensch-Hund',
      'Führung/Beruf',
      'Team',
      'Freundschaft',
      'Innerer Konflikt',
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
  // v2: "Sonstiges" aus Beziehung entfernen (Herkunft wird unten ohnehin hart gesetzt)
  data.vocab.relationships = data.vocab.relationships.filter(
    (v) => v.toLowerCase() !== 'sonstiges'
  );

  // v4: Herkunft ist eine geschlossene Liste. Frei eingetippte Werte raus.
  data.vocab.sources = [...SOURCE_OPTIONS];

  for (const k of ['customers', 'cases', 'sessions', 'patterns', 'revenue', 'feedback']) {
    if (!Array.isArray(data[k])) data[k] = [];
  }

  // v4: Kunden-Herkunft auf leer setzen, wenn nicht in der geschlossenen Liste
  const validSources = new Set(SOURCE_OPTIONS.map((v) => v.toLowerCase()));
  data.customers = data.customers.map((c) => {
    if (c.source && !validSources.has(c.source.toLowerCase())) {
      return { ...c, source: '' };
    }
    return c;
  });

  // v3: Einverständnis-Datei-Felder aus Sessions entfernen
  // v5: recordingLink aus Sessions entfernen (Feld nicht mehr genutzt)
  data.sessions = data.sessions.map((s) => {
    const { consentFileId, consentFileName, consentFileType, recordingLink, ...rest } = s;
    return rest;
  });

  if (typeof data.lastBackupAt !== 'string' && data.lastBackupAt !== null) {
    data.lastBackupAt = null;
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
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveError((curr) => (curr === null ? curr : null));
    } catch (e) {
      const isQuota =
        e?.name === 'QuotaExceededError' ||
        e?.code === 22 ||
        e?.code === 1014;
      const msg = isQuota
        ? 'Speicher voll. Lade ein Backup herunter und lösche alte Datensätze, sonst gehen Änderungen beim Refresh verloren.'
        : `Speichern fehlgeschlagen: ${e?.message || 'unbekannter Fehler'}. Änderungen können beim Refresh verloren gehen.`;
      console.error('[CRM] LocalStorage-Schreibfehler:', e);
      setSaveError((curr) => (curr === msg ? curr : msg));
    }
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
      saveError,
      clearSaveError: () => setSaveError(null),

      createCustomer({ source }) {
        const id = uid();
        const safeSource = SOURCE_OPTIONS.includes(source) ? source : '';
        setState((s) => {
          const number = formatNumber('K', nextNumber(s.customers, 'number'));
          return {
            ...s,
            customers: [...s.customers, { id, number, source: safeSource }],
          };
        });
        return id;
      },

      updateCustomer(id, patch) {
        const safePatch = { ...patch };
        if ('source' in safePatch) {
          safePatch.source = SOURCE_OPTIONS.includes(safePatch.source)
            ? safePatch.source
            : '';
        }
        setState((s) => ({
          ...s,
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...safePatch } : c)),
        }));
      },

      deleteCustomer(id) {
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
              description: payload.description ?? '',
              intervention: payload.intervention ?? '',
              ahaMoment: payload.ahaMoment ?? '',
              result: payload.result ?? '',
              nextStep: payload.nextStep ?? '',
              nextContact: payload.nextContact ?? '',
              transcript: payload.transcript ?? '',
              consentGiven: true,
              contentIdea: payload.contentIdea ?? '',
              contentAngle: payload.contentAngle ?? '',
              contentStatus: payload.contentStatus ?? 'Idee',
            },
          ],
        }));
        return id;
      },

      updateSession(id, patch) {
        if (patch.consentGiven === false) {
          throw new Error('Einverständnis darf nicht entfernt werden.');
        }
        setState((s) => ({
          ...s,
          sessions: s.sessions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }));
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

      updateRevenue(id, patch) {
        setState((s) => ({
          ...s,
          revenue: s.revenue.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...patch,
                  amount:
                    'amount' in patch ? Number(patch.amount) || 0 : r.amount,
                }
              : r
          ),
        }));
      },

      deleteRevenue(id) {
        setState((s) => ({ ...s, revenue: s.revenue.filter((r) => r.id !== id) }));
      },

      createFeedback({ text, page }) {
        if (!text?.trim()) return null;
        const id = uid();
        setState((s) => ({
          ...s,
          feedback: [
            ...s.feedback,
            {
              id,
              text: text.trim(),
              page: page ?? '',
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      deleteFeedback(id) {
        setState((s) => ({ ...s, feedback: s.feedback.filter((f) => f.id !== id) }));
      },

      markBackupTaken() {
        setState((s) => ({ ...s, lastBackupAt: new Date().toISOString() }));
      },

      importBackup(payload) {
        let parsed = payload;
        if (typeof payload === 'string') {
          try {
            parsed = JSON.parse(payload);
          } catch (e) {
            throw new Error('Datei ist kein gültiges JSON.');
          }
        }
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Datei enthält keine Backup-Struktur.');
        }
        const migrated = migrate(parsed);
        setState(migrated);
      },

      addVocab,
    };
  }, [state, saveError]);

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

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loud, sonst silent fallback und keiner versteht, warum nichts läd.
  console.error(
    '[CRM] Supabase-Umgebungsvariablen fehlen. VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in .env.local setzen.'
  );
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function formatSupabaseError(error) {
  if (!error) return 'Unbekannter Fehler';
  if (typeof error === 'string') return error;
  return error.message || error.error_description || JSON.stringify(error);
}

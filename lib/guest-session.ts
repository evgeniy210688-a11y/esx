import { supabase } from './supabase';

// Share the in-flight request across effect re-runs so one scan creates one guest.
let pending: Promise<void> | null = null;
export function ensureChatSession(): Promise<void> {
  if (!pending) {
    pending = (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) return;
      const result = await supabase.auth.signInAnonymously();
      if (result.error) throw result.error;
      if (!result.data.session) throw new Error('Guest session was not created');
    })().finally(() => { pending = null; });
  }
  return pending;
}

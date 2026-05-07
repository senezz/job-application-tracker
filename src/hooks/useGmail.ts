import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchGmailEmails, type GmailEmail } from '../lib/api/gmail';

export type { GmailEmail };
export type GmailError = 'not_connected' | 'token_expired' | 'scope_missing' | 'failed';

export function useGmailConnect() {
  const connect = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/gmail.readonly',
        redirectTo: `${window.location.origin}/your-data`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.provider_token ?? null;
  }, []);

  return { connect, getToken };
}

export function useGmailEmails() {
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GmailError | null>(null);
  const { getToken } = useGmailConnect();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) { setError('not_connected'); return; }
      const result = await fetchGmailEmails(token);
      setEmails(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'token_expired') setError('token_expired');
      else if (msg === 'scope_missing') setError('scope_missing');
      else setError('failed');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { emails, loading, error, load };
}

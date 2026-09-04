import { useState, useCallback, useEffect } from 'react';
import { getGmailConnectUrl, getGmailStatus, fetchGmailEmails, type GmailEmail } from '../lib/api/gmail';

export type { GmailEmail };
export type GmailError = 'not_connected' | 'token_expired' | 'scope_missing' | 'failed';

export function useGmailConnect() {
  const connect = useCallback(async () => {
    const url = await getGmailConnectUrl();
    window.location.href = url;
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    const status = await getGmailStatus().catch(() => ({ connected: false }) as const);
    return status.connected ? (status as { accessToken?: string }).accessToken ?? null : null;
  }, []);

  return { connect, getToken };
}

export function useGmailStatus() {
  const [connected, setConnected] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    const status = await getGmailStatus().catch(() => ({ connected: false }) as const);
    setConnected(status.connected);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { connected, refresh };
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

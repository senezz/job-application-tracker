import { apiFetch } from './client';

export interface GmailEmail {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  snippet: string;
  body: string;
}

export interface GmailStatus {
  connected: boolean;
  accessToken?: string;
  scope?: string;
  connectedAt?: string;
}

export async function getGmailConnectUrl(): Promise<string> {
  const { url } = await apiFetch<{ url: string }>('/gmail/connect');
  return url;
}

export async function getGmailStatus(): Promise<GmailStatus> {
  return apiFetch<GmailStatus>('/gmail/token', { skipAuthRedirect: true });
}

export async function fetchGmailEmails(accessToken: string): Promise<GmailEmail[]> {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (listRes.status === 401) throw new Error('token_expired');
  if (listRes.status === 403) throw new Error('scope_missing');
  if (!listRes.ok) throw new Error('Failed to fetch Gmail messages');

  const listData = await listRes.json();
  const messages: { id: string }[] = listData.messages ?? [];

  const emails = await Promise.all(messages.map(m => fetchEmailById(accessToken, m.id)));
  return emails.filter((e): e is GmailEmail => e !== null);
}

async function fetchEmailById(accessToken: string, messageId: string): Promise<GmailEmail | null> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) return null;
  return parseEmailContent(await res.json());
}

function parseEmailContent(message: Record<string, unknown>): GmailEmail {
  const headers: { name: string; value: string }[] =
    (message.payload as Record<string, unknown>)?.headers as never ?? [];
  const get = (name: string) =>
    headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';

  return {
    id: message.id as string,
    sender: get('from'),
    subject: get('subject'),
    receivedAt: get('date'),
    snippet: (message.snippet as string) ?? '',
    body: extractBody(message.payload as Record<string, unknown>),
  };
}

function extractBody(payload: Record<string, unknown>): string {
  if (!payload) return '';

  const body = payload.body as Record<string, unknown> | undefined;
  if (body?.data) return decodeBase64(body.data as string);

  const parts = payload.parts as Record<string, unknown>[] | undefined;
  if (parts) {
    const text = parts.find(p => p.mimeType === 'text/plain');
    if (text) {
      const d = (text.body as Record<string, unknown>)?.data as string | undefined;
      if (d) return decodeBase64(d);
    }
    const html = parts.find(p => p.mimeType === 'text/html');
    if (html) {
      const d = (html.body as Record<string, unknown>)?.data as string | undefined;
      if (d) return decodeBase64(d).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  return '';
}

function decodeBase64(encoded: string): string {
  return atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
}

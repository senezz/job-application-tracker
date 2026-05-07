import { useEffect } from 'react';
import { Mail, Loader2, RefreshCw, Paperclip, Trash2, AlertCircle, Inbox } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGmailConnect, useGmailEmails, type GmailEmail } from '../../hooks/useGmail';
import { useResponses, useSaveResponse, useDeleteResponse } from '../../hooks/useResponses';
import type { Application } from '../../types';

interface Props {
  app: Application | null;
  open: boolean;
  onClose: () => void;
}

export function EmailsDialog({ app, open, onClose }: Props) {
  const { emails, loading, error, load } = useGmailEmails();
  const { connect } = useGmailConnect();
  const { data: attached = [], isLoading: attachedLoading } = useResponses(app?.id ?? '');
  const { mutate: save, isPending: saving } = useSaveResponse();
  const { mutate: detach } = useDeleteResponse();

  useEffect(() => {
    if (open && app) load();
  }, [open, app, load]);

  const isAttached = (gmailId: string) =>
    attached.some(r => r.gmail_message_id === gmailId);

  const handleAttach = (email: GmailEmail) => {
    if (!app) return;
    save({
      application_id: app.id,
      gmail_message_id: email.id,
      sender: email.sender,
      subject: email.subject,
      received_at: new Date(email.receivedAt).toISOString().slice(0, 10),
      content: email.body || email.snippet,
    });
  };

  const handleDetach = (responseId: string) => {
    if (!app) return;
    detach({ id: responseId, applicationId: app.id });
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl w-full bg-card border-border max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Mail size={16} />
            Emails — {app?.company}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {error === 'not_connected' && (
            <NotConnectedState onConnect={connect} />
          )}

          {(error === 'token_expired' || error === 'scope_missing') && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle size={28} className="text-amber-500" />
              <p className="text-sm text-muted-foreground max-w-xs">
                {error === 'scope_missing'
                  ? 'Gmail access not granted. Please reconnect and allow access to your emails.'
                  : 'Your Gmail session expired. Please reconnect.'}
              </p>
              <Button variant="outline" className="gap-2" onClick={connect}>
                <Mail size={14} />
                Reconnect Gmail
              </Button>
            </div>
          )}

          {error === 'failed' && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle size={28} className="text-destructive" />
              <p className="text-sm text-muted-foreground">Failed to load emails.</p>
              <Button variant="outline" size="sm" onClick={load} className="gap-2">
                <RefreshCw size={13} />
                Retry
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && !error && (
            <>
              {(attachedLoading || attached.length > 0) && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Attached to this application
                  </h3>
                  {attachedLoading ? (
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  ) : (
                    attached.map(r => (
                      <div
                        key={r.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/20"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {r.subject || '(no subject)'}
                          </p>
                          <p className="text-sm text-muted-foreground">{r.sender}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.received_at
                              ? new Date(r.received_at).toLocaleDateString()
                              : ''}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-400 shrink-0 mt-0.5"
                          title="Detach"
                          onClick={() => handleDetach(r.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))
                  )}
                </section>
              )}

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Recruitment emails from Gmail
                  </h3>
                  <button
                    onClick={load}
                    className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <RefreshCw size={11} />
                    Refresh
                  </button>
                </div>

                {emails.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Inbox size={28} className="text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No recruitment emails found</p>
                  </div>
                ) : (
                  emails.map(email => {
                    const already = isAttached(email.id);
                    return (
                      <div
                        key={email.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {email.subject || '(no subject)'}
                          </p>
                          <p className="text-sm text-muted-foreground">{email.sender}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {email.snippet}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(email.receivedAt)}
                          </span>
                          <Button
                            variant={already ? 'outline' : 'secondary'}
                            size="sm"
                            className="gap-1.5"
                            disabled={already || saving}
                            onClick={() => handleAttach(email)}
                          >
                            <Paperclip size={12} />
                            {already ? 'Attached' : 'Attach'}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NotConnectedState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Mail size={22} className="text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Gmail not connected</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Connect your Gmail account to find recruitment emails and attach them to this
          application — interview invites, offers, rejections and more.
        </p>
      </div>
      <Button variant="outline" className="gap-2" onClick={onConnect}>
        <Mail size={14} />
        Connect Gmail to track your emails
      </Button>
    </div>
  );
}

function formatDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString();
  } catch {
    return raw;
  }
}

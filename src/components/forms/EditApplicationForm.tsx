import { useEffect, useState } from 'react';
import { Copy, Check, ExternalLink, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateApplication } from '../../hooks/useApplications';
import { EmailsDialog } from '../gmail/EmailsDialog';
import type { Application, ApplicationStatus } from '../../types';

interface Props {
  app: Application | null;
  onClose: () => void;
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved:     'Saved',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
};

interface FormState {
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  url: string;
  notes: string;
}

const emptyForm: FormState = {
  company: '', role: '', status: 'applied', appliedDate: '', url: '', notes: '',
};

function formFromApp(app: Application): FormState {
  return {
    company: app.company,
    role: app.role,
    status: app.status,
    appliedDate: app.applied_date,
    url: app.url ?? '',
    notes: app.notes ?? '',
  };
}

export function EditApplicationForm({ app, onClose }: Props) {
  const { mutateAsync, isPending } = useUpdateApplication();

  const [form, setForm]             = useState<FormState>(emptyForm);
  const [copied, setCopied]         = useState(false);
  const [emailsOpen, setEmailsOpen] = useState(false);

  useEffect(() => {
    if (app) setForm(formFromApp(app));
  }, [app]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleCopy = async () => {
    if (!form.url) return;
    await navigator.clipboard.writeText(form.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!app) return;
    try {
      await mutateAsync({
        id: app.id,
        dto: {
          company: form.company,
          role: form.role,
          status: form.status,
          applied_date: form.appliedDate,
          url: form.url || undefined,
          notes: form.notes || undefined,
        },
      });
      toast.success('Application updated');
      onClose();
    } catch {
      toast.error('Failed to update application');
    }
  };

  return (
    <>
      <Dialog open={!!app} onOpenChange={open => !open && onClose()}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit application</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Company</label>
                <Input value={form.company} onChange={set('company')} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Role</label>
                <Input value={form.role} onChange={set('role')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ApplicationStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map(s => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Date applied</label>
                <Input type="date" value={form.appliedDate} onChange={set('appliedDate')} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Job posting URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={form.url}
                  onChange={set('url')}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  disabled={!form.url}
                  title="Copy URL"
                >
                  {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                </Button>
                {form.url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(form.url, '_blank')}
                    title="Open URL"
                  >
                    <ExternalLink size={15} />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-muted-foreground">Notes</label>
                <span className="text-xs text-muted-foreground">{form.notes.length}/500</span>
              </div>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value.slice(0, 500) }))}
                rows={4}
                placeholder="Interview notes, contacts, impressions…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setEmailsOpen(true)}
              >
                <Mail size={14} />
                Emails
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EmailsDialog app={app} open={emailsOpen} onClose={() => setEmailsOpen(false)} />
    </>
  );
}

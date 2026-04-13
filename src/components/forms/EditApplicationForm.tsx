import { useEffect, useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
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

export function EditApplicationForm({ app, onClose }: Props) {
  const { mutateAsync, isPending } = useUpdateApplication();

  const [company, setCompany]       = useState('');
  const [role, setRole]             = useState('');
  const [status, setStatus]         = useState<ApplicationStatus>('applied');
  const [appliedDate, setAppliedDate] = useState('');
  const [url, setUrl]               = useState('');
  const [notes, setNotes]           = useState('');
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    if (app) {
      setCompany(app.company);
      setRole(app.role);
      setStatus(app.status);
      setAppliedDate(app.applied_date);
      setUrl(app.url ?? '');
      setNotes(app.notes ?? '');
    }
  }, [app]);

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!app) return;
    try {
      await mutateAsync({
        id: app.id,
        dto: {
          company,
          role,
          status,
          applied_date: appliedDate,
          url: url || undefined,
          notes: notes || undefined,
        },
      });
      toast.success('Application updated');
      onClose();
    } catch {
      toast.error('Failed to update application');
    }
  };

  return (
    <Dialog open={!!app} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit application</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Company</label>
              <Input value={company} onChange={e => setCompany(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Role</label>
              <Input value={role} onChange={e => setRole(e.target.value)} />
            </div>
          </div>

          {/* Status + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={status} onValueChange={v => setStatus(v as ApplicationStatus)}>
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
              <Input type="date" value={appliedDate} onChange={e => setAppliedDate(e.target.value)} />
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Job posting URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={!url}
                title="Copy URL"
              >
                {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
              </Button>
              {url && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(url, '_blank')}
                  title="Open URL"
                >
                  <ExternalLink size={15} />
                </Button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-muted-foreground">Notes</label>
              <span className="text-xs text-muted-foreground">{notes.length}/500</span>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Interview notes, contacts, impressions…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

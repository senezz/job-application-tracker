import { useState, useEffect, useRef } from 'react';
import { Plus, Copy, Trash2, Check, Download, Eye, Upload, FileText, Loader2, Mail } from 'lucide-react';
import { GmailConnect } from '../components/gmail/GmailConnect';
import { toast } from 'sonner';
import { getProfile, updateProfile, uploadCv, getCvUrl, deleteCv as deleteCvRequest } from '../lib/api/profile';
import { ApiError } from '../lib/api/client';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProfileLink {
  id: string;
  url: string;
}

interface FormState {
  fullName: string;
  phone: string;
  links: ProfileLink[];
  cvName: string | null;
}

const empty: FormState = {
  fullName: '',
  phone: '',
  links: [],
  cvName: null,
};

function parseLink(url: string): ProfileLink {
  return { id: crypto.randomUUID(), url };
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      disabled={!value}
      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export function YourDataPage() {
  const [profile, setProfile] = useState<FormState>(empty);
  const [hasCv, setHasCv] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile();
        setProfile({
          fullName: data.fullName ?? '',
          phone: data.phone ?? '',
          links: data.links.map(parseLink),
          cvName: data.cvName,
        });
        setHasCv(Boolean(data.cvKey));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({
        fullName: profile.fullName,
        phone: profile.phone,
        links: profile.links.map(l => l.url).filter(Boolean),
      });
      toast.success('Saved successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    setProfile(p => ({
      ...p,
      links: [...p.links, { id: crypto.randomUUID(), url: '' }],
    }));
  };

  const updateLink = (id: string, value: string) => {
    setProfile(p => ({
      ...p,
      links: p.links.map(l => l.id === id ? { ...l, url: value } : l),
    }));
  };

  const removeLink = (id: string) => {
    setProfile(p => ({ ...p, links: p.links.filter(l => l.id !== id) }));
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    if (!allowed.has(file.type)) {
      toast.error('Only PDF, DOC or DOCX files are supported');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5 MB)');
      return;
    }

    setCvUploading(true);
    try {
      const data = await uploadCv(file);
      setProfile(p => ({ ...p, cvName: data.cvName }));
      setHasCv(true);
      toast.success('CV uploaded successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setCvUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadCv = async () => {
    try {
      const { url } = await getCvUrl();
      const a = document.createElement('a');
      a.href = url;
      a.download = profile.cvName ?? 'cv';
      a.click();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Download failed');
    }
  };

  const previewCv = async () => {
    try {
      const { url } = await getCvUrl();
      window.open(url, '_blank');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Preview failed');
    }
  };

  const deleteCv = async () => {
    try {
      await deleteCvRequest();
      setProfile(p => ({ ...p, cvName: null }));
      setHasCv(false);
      toast.success('CV removed');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove CV');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border shrink-0 anim-fade-down">
          <h1 className="text-xl font-semibold text-foreground pl-10 md:pl-0">Your Data</h1>
          <Button onClick={save} disabled={saving} className="transition-transform active:scale-95">
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </span>
            ) : 'Save'}
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-2xl">
          <div className="space-y-6 anim-fade-up">

            {/* Personal info */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Personal Info</h2>
              <Field label="Full name" value={profile.fullName} onChange={v => setProfile(p => ({ ...p, fullName: v }))} />
              <Field label="Phone" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} type="tel" />
            </section>

            {/* Links */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Links</h2>
                <Button variant="outline" size="sm" onClick={addLink} className="gap-1 h-7 text-xs">
                  <Plus size={12} />
                  Add link
                </Button>
              </div>

              {profile.links.length === 0 && (
                <p className="text-sm text-muted-foreground">No links yet. Click "Add link" to add one.</p>
              )}

              {profile.links.map(link => (
                <div key={link.id} className="flex items-center gap-2">
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    value={link.url}
                    onChange={e => updateLink(link.id, e.target.value)}
                    className="flex-1"
                  />
                  <CopyButton value={link.url} />
                  <button
                    onClick={() => removeLink(link.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-accent transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </section>

            {/* Gmail */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Gmail</h2>
              </div>
              <GmailConnect />
            </section>

            {/* CV */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">CV / Resume</h2>

              {hasCv ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <FileText size={20} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">{profile.cvName}</span>
                  <button
                    onClick={previewCv}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Preview"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={downloadCv}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={deleteCv}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-accent transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-muted-foreground transition-colors',
                    cvUploading && 'opacity-50 pointer-events-none',
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {cvUploading ? (
                    <Loader2 size={24} className="animate-spin text-muted-foreground" />
                  ) : (
                    <Upload size={24} className="text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {cvUploading ? 'Uploading…' : 'Click to upload PDF, DOC or DOCX (max 5 MB)'}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleCvUpload}
              />

              {hasCv && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={cvUploading}
                >
                  <Upload size={14} />
                  Replace CV
                </Button>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground w-28 shrink-0">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={label}
        className="flex-1"
      />
      <CopyButton value={value} />
      <button
        onClick={() => onChange('')}
        disabled={!value}
        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Clear"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

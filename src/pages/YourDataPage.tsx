import { useState, useEffect, useRef } from 'react';
import { Plus, Copy, Trash2, Check, Download, Eye, Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProfileLink {
  id: string;
  label: string;
  url: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  phone: string;
  contact_email: string;
  links: ProfileLink[];
  cv_file_path: string | null;
  cv_file_name: string | null;
}

const empty: UserProfile = {
  first_name: '',
  last_name: '',
  phone: '',
  contact_email: '',
  links: [],
  cv_file_path: null,
  cv_file_name: null,
};

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
  const [profile, setProfile] = useState<UserProfile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          phone: data.phone ?? '',
          contact_email: data.contact_email ?? '',
          links: Array.isArray(data.links) ? data.links : [],
          cv_file_path: data.cv_file_path ?? null,
          cv_file_name: data.cv_file_name ?? null,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        phone: profile.phone || null,
        contact_email: profile.contact_email || null,
        links: profile.links,
        cv_file_path: profile.cv_file_path,
        cv_file_name: profile.cv_file_name,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success('Saved successfully');
    }
  };

  const addLink = () => {
    setProfile(p => ({
      ...p,
      links: [...p.links, { id: crypto.randomUUID(), label: '', url: '' }],
    }));
  };

  const updateLink = (id: string, field: 'label' | 'url', value: string) => {
    setProfile(p => ({
      ...p,
      links: p.links.map(l => l.id === id ? { ...l, [field]: value } : l),
    }));
  };

  const removeLink = (id: string) => {
    setProfile(p => ({ ...p, links: p.links.filter(l => l.id !== id) }));
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5 MB)');
      return;
    }

    setCvUploading(true);

    if (profile.cv_file_path) {
      await supabase.storage.from('cv-files').remove([profile.cv_file_path]);
    }

    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('cv-files').upload(path, file);
    if (error) {
      toast.error('Upload failed: ' + error.message);
      setCvUploading(false);
      return;
    }

    const newProfile = { ...profile, cv_file_path: path, cv_file_name: file.name };
    setProfile(newProfile);
    setCvPreviewUrl(null);

    await supabase.from('user_profiles').upsert({
      id: userId,
      first_name: newProfile.first_name || null,
      last_name: newProfile.last_name || null,
      phone: newProfile.phone || null,
      contact_email: newProfile.contact_email || null,
      links: newProfile.links,
      cv_file_path: path,
      cv_file_name: file.name,
      updated_at: new Date().toISOString(),
    });

    setCvUploading(false);
    toast.success('CV uploaded successfully');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadCv = async () => {
    if (!profile.cv_file_path) return;
    const { data, error } = await supabase.storage.from('cv-files').download(profile.cv_file_path);
    if (error || !data) { toast.error('Download failed'); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = profile.cv_file_name ?? 'cv.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewCv = async () => {
    if (!profile.cv_file_path) return;
    if (cvPreviewUrl) {
      window.open(cvPreviewUrl, '_blank');
      return;
    }
    const { data, error } = await supabase.storage.from('cv-files').download(profile.cv_file_path);
    if (error || !data) { toast.error('Preview failed'); return; }
    const url = URL.createObjectURL(data);
    setCvPreviewUrl(url);
    window.open(url, '_blank');
  };

  const deleteCv = async () => {
    if (!profile.cv_file_path || !userId) return;
    await supabase.storage.from('cv-files').remove([profile.cv_file_path]);
    const newProfile = { ...profile, cv_file_path: null, cv_file_name: null };
    setProfile(newProfile);
    setCvPreviewUrl(null);
    await supabase.from('user_profiles').upsert({
      id: userId,
      ...newProfile,
      updated_at: new Date().toISOString(),
    });
    toast.success('CV removed');
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
              <Field label="First name" value={profile.first_name} onChange={v => setProfile(p => ({ ...p, first_name: v }))} />
              <Field label="Last name" value={profile.last_name} onChange={v => setProfile(p => ({ ...p, last_name: v }))} />
              <Field label="Phone" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} type="tel" />
              <Field label="Email" value={profile.contact_email} onChange={v => setProfile(p => ({ ...p, contact_email: v }))} type="email" />
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
                    placeholder="Label (e.g. LinkedIn)"
                    value={link.label}
                    onChange={e => updateLink(link.id, 'label', e.target.value)}
                    className="w-36 shrink-0"
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={e => updateLink(link.id, 'url', e.target.value)}
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

            {/* CV */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">CV / Resume</h2>

              {profile.cv_file_path ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <FileText size={20} className="text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">{profile.cv_file_name}</span>
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
                    {cvUploading ? 'Uploading…' : 'Click to upload PDF (max 5 MB)'}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleCvUpload}
              />

              {profile.cv_file_path && (
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

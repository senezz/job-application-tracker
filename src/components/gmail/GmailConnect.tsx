import { useEffect, useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '../../lib/supabase';
import { useGmailConnect } from '../../hooks/useGmail';

export function GmailConnect() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const { connect } = useGmailConnect();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setConnected(!!session?.provider_token);
    });
  }, []);

  if (connected === null) {
    return <Loader2 size={16} className="animate-spin text-muted-foreground" />;
  }

  if (connected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-500">
        <CheckCircle2 size={16} />
        <span>Gmail connected</span>
        <button
          onClick={connect}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:opacity-70 transition-opacity ml-2"
        >
          Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Connect your Gmail to automatically find recruitment emails and attach them to your
        applications — offers, interview invites, rejections and more.
      </p>
      <Button variant="outline" className="gap-2 w-fit" onClick={connect}>
        <Mail size={15} />
        Connect Gmail to track your emails
      </Button>
    </div>
  );
}

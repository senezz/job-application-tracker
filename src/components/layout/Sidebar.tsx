import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col w-56 min-h-screen border-r border-border bg-card px-3 py-4">
      <div className="px-2 mb-6">
        <span className="text-lg font-semibold tracking-tight text-foreground">Jobtrace</span>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem icon={<LayoutDashboard size={16} />} label="Dashboard" active />
      </nav>

      <Button
        variant="ghost"
        className={cn('w-full justify-start gap-2 text-muted-foreground hover:text-foreground')}
        onClick={handleSignOut}
      >
        <LogOut size={16} />
        Sign out
      </Button>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

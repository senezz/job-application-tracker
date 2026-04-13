import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const email = user?.email ?? '';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const provider = user?.app_metadata?.provider;
  const providerLabel = provider === 'google' ? 'via Google' : 'via Email';

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'flex flex-col min-h-screen border-r border-border bg-card px-3 py-4 anim-fade-left transition-[width] duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-[60px]' : 'w-56',
        )}
      >
        {/* Logo + collapse toggle */}
        <div className={cn('flex items-center mb-6', collapsed ? 'justify-center' : 'justify-between px-1')}>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight text-foreground whitespace-nowrap">
              Jobtrace
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCollapsed(v => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-accent"
              >
                {collapsed
                  ? <PanelLeftOpen size={18} />
                  : <PanelLeftClose size={18} />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={16} />}
            label="Dashboard"
            active
            collapsed={collapsed}
          />
        </nav>

        {/* User profile */}
        <div
          className={cn(
            'mb-2 py-3 rounded-lg bg-muted/40 anim-fade-in flex items-center gap-3 transition-all duration-300',
            collapsed ? 'justify-center px-0' : 'px-2',
          )}
          style={{ animationDelay: '200ms' }}
        >
          <div className="shrink-0">
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-border"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center ring-1 ring-border">
                <User size={18} className="text-zinc-400" />
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{email}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{providerLabel}</p>
            </div>
          )}
        </div>

        {/* Sign out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full text-muted-foreground hover:text-foreground transition-all duration-300',
                collapsed ? 'justify-center px-0' : 'justify-start gap-2',
              )}
              onClick={handleSignOut}
            >
              <LogOut size={16} className="shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Sign out</TooltipContent>
          )}
        </Tooltip>
      </aside>
    </TooltipProvider>
  );
}

function NavItem({
  icon,
  label,
  active,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'flex items-center w-full rounded-md text-sm transition-colors duration-200',
            collapsed ? 'justify-center px-0 py-2' : 'gap-2 px-2 py-1.5',
            active
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {icon}
          {!collapsed && <span>{label}</span>}
        </button>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right">{label}</TooltipContent>
      )}
    </Tooltip>
  );
}

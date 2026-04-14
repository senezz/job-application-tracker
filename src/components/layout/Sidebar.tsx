import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, User, PanelLeftClose, PanelLeftOpen, UserCircle, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
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
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const email = user?.email ?? '';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const provider = user?.app_metadata?.provider;
  const providerLabel = provider === 'google' ? 'via Google' : 'via Email';

  const navItems = [
    { icon: <LayoutDashboard size={16} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <UserCircle size={16} />, label: 'Your Data', path: '/your-data' },
  ];

  const sidebarContent = (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          'flex flex-col h-full border-r border-border bg-card px-3 py-4 anim-fade-left transition-[width] duration-300 ease-in-out overflow-hidden',
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

        {/* Theme toggle */}
        <div className={cn('mb-4', collapsed ? 'flex justify-center' : 'px-1')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'flex items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
                  collapsed ? 'p-2' : 'px-2 py-1.5 w-full',
                )}
              >
                {theme === 'dark'
                  ? <Sun size={16} className="shrink-0" />
                  : <Moon size={16} className="shrink-0" />
                }
                {!collapsed && (
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              collapsed={collapsed}
              onClick={() => navigate(item.path)}
            />
          ))}
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
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center ring-1 ring-border">
                <User size={18} className="text-muted-foreground" />
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

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'md:hidden fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <TooltipProvider delayDuration={200}>
          <aside className="flex flex-col h-full w-56 border-r border-border bg-card px-3 py-4 overflow-hidden">
            <div className="flex items-center justify-between px-1 mb-6">
              <span className="text-lg font-semibold tracking-tight text-foreground">Jobtrace</span>
            </div>

            {/* Theme toggle mobile */}
            <div className="mb-4 px-1">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'flex items-center w-full gap-2 px-2 py-1.5 rounded-md text-sm transition-colors duration-200',
                    location.pathname === item.path
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mb-2 py-3 rounded-lg bg-muted/40 px-2 flex items-center gap-3">
              <div className="shrink-0">
                {avatarUrl && !avatarError ? (
                  <img src={avatarUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover ring-1 ring-border" onError={() => setAvatarError(true)} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center ring-1 ring-border">
                    <User size={18} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{email}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{providerLabel}</p>
              </div>
            </div>

            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
              <LogOut size={16} />
              <span>Sign out</span>
            </Button>
          </aside>
        </TooltipProvider>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block min-h-screen">
        {sidebarContent}
      </div>
    </>
  );
}

function NavItem({
  icon,
  label,
  active,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
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

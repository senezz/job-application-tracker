import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { StatusChart } from '../components/dashboard/StatusChart';
import { ApplicationsTable } from '../components/dashboard/ApplicationsTable';
import { AddApplicationForm } from '../components/forms/AddApplicationForm';
import { Button } from '@/components/ui/button';
import { useApplications } from '../hooks/useApplications';
import { computeStats } from '../lib/stats';

export function DashboardPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: apps = [], isLoading } = useApplications();
  const stats = computeStats(apps);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center justify-between px-8 py-4 border-b border-border shrink-0 anim-fade-down"
          style={{ animationDelay: '80ms' }}
        >
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <Button onClick={() => setFormOpen(true)} className="gap-2 transition-transform active:scale-95">
            <Plus size={16} />
            Add application
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm anim-fade-in">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              <div className="anim-fade-up" style={{ animationDelay: '150ms' }}>
                <StatsCards stats={stats} />
              </div>
              <div className="flex gap-4 anim-fade-up" style={{ animationDelay: '280ms' }}>
                <ActivityChart apps={apps} />
                <StatusChart apps={apps} />
              </div>
              <div className="anim-fade-up" style={{ animationDelay: '400ms' }}>
                <ApplicationsTable apps={apps} />
              </div>
            </>
          )}
        </div>
      </main>

      <AddApplicationForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

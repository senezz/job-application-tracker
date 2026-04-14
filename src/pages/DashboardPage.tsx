import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { StatusChart } from '../components/dashboard/StatusChart';
import { ApplicationsTable } from '../components/dashboard/ApplicationsTable';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { EmptyState } from '../components/dashboard/EmptyState';
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
          className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border shrink-0 anim-fade-down"
          style={{ animationDelay: '80ms' }}
        >
          <h1 className="text-xl font-semibold text-foreground pl-10 md:pl-0">Dashboard</h1>
          {!isLoading && apps.length > 0 && (
            <Button onClick={() => setFormOpen(true)} className="gap-2 transition-transform active:scale-95">
              <Plus size={16} />
              Add application
            </Button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {isLoading ? (
            <DashboardSkeleton />
          ) : apps.length === 0 ? (
            <EmptyState onAdd={() => setFormOpen(true)} />
          ) : (
            <div className="space-y-6">
              <div className="anim-fade-up" style={{ animationDelay: '150ms' }}>
                <StatsCards stats={stats} />
              </div>
              <div className="flex flex-col md:flex-row gap-4 anim-fade-up" style={{ animationDelay: '280ms' }}>
                <ActivityChart apps={apps} />
                <StatusChart apps={apps} />
              </div>
              <div className="anim-fade-up" style={{ animationDelay: '400ms' }}>
                <ApplicationsTable apps={apps} />
              </div>
            </div>
          )}
        </div>
      </main>

      <AddApplicationForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function StatCardSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-1">
        <Skeleton className="h-3 w-16" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-2.5 w-24" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-2">
        <Skeleton className="h-3 w-36" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-border bg-muted/30">
        {['w-24', 'w-20', 'w-16', 'w-14'].map((w, i) => (
          <Skeleton key={i} className={`h-3 ${w}`} />
        ))}
      </div>
      {/* rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 px-4 py-3.5 border-b border-border last:border-0"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 anim-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="flex gap-4">
        <ChartSkeleton className="flex-1" />
        <ChartSkeleton className="w-72 shrink-0" />
      </div>

      {/* Table */}
      <div className="space-y-3">
        {/* filters bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {[72, 60, 72, 48].map((w, i) => (
              <Skeleton key={i} className="h-8 rounded-md" style={{ width: w }} />
            ))}
          </div>
          <Skeleton className="h-8 w-48 rounded-md" />
        </div>
        <TableSkeleton />
      </div>
    </div>
  );
}

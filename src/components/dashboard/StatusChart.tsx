import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Application, ApplicationStatus } from '../../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved:     '#71717a',
  applied:   '#3b82f6',
  interview: '#f59e0b',
  offer:     '#22c55e',
  rejected:  '#ef4444',
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved:     'Saved',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
};

interface Props {
  apps: Application[];
}

export function StatusChart({ apps }: Props) {
  const counts = (Object.keys(STATUS_COLORS) as ApplicationStatus[]).map(status => ({
    status,
    count: apps.filter(a => a.status === status).length,
  })).filter(d => d.count > 0);

  return (
    <Card className="bg-card border-border w-72 shrink-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">By status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={counts}
                dataKey="count"
                nameKey="status"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={2}
                strokeWidth={0}
              >
                {counts.map(entry => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 6 }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(value, name) => [value, STATUS_LABELS[name as ApplicationStatus]]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-1.5">
            {counts.map(entry => (
              <div key={entry.status} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                />
                <span className="text-muted-foreground">{STATUS_LABELS[entry.status]}</span>
                <span className="ml-auto text-foreground font-medium">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

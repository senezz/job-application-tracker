import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Application } from '../../types';

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function getWeekLabel(weeksAgo: number): { key: string; label: string } {
  const d = new Date();
  d.setDate(d.getDate() - weeksAgo * 7);
  const key = getISOWeek(d);
  const label = weeksAgo === 0 ? 'This week' : `${weeksAgo}w ago`;
  return { key, label };
}

function groupByWeek(apps: Application[]) {
  const weeks = Array.from({ length: 8 }, (_, i) => getWeekLabel(7 - i));
  const counts: Record<string, number> = {};
  for (const app of apps) {
    const key = getISOWeek(new Date(app.applied_date));
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return weeks.map(({ key, label }) => ({ week: label, count: counts[key] ?? 0 }));
}

interface Props {
  apps: Application[];
}

export function ActivityChart({ apps }: Props) {
  const data = groupByWeek(apps);

  return (
    <Card className="bg-card border-border flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Activity (last 8 weeks)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 6 }}
              labelStyle={{ color: '#a1a1aa' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#areaGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

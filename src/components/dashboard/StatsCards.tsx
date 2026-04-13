import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats } from '../../types';

interface Props {
  stats: DashboardStats;
}

export function StatsCards({ stats }: Props) {
  const cards = [
    { label: 'Total', value: stats.total, sub: null },
    { label: 'Applied', value: stats.applied, sub: null },
    { label: 'Interviews', value: stats.interviews, sub: `${stats.interviewRate}% interview rate` },
    { label: 'Offers', value: stats.offers, sub: `${stats.offerRate}% offer rate` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card key={card.label} className="bg-card border-border">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            {card.sub && (
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

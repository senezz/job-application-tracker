import type { Application, DashboardStats } from '../types';

export function computeStats(apps: Application[]): DashboardStats {
  const applied    = apps.filter(a => a.status !== 'saved').length;
  const interviews = apps.filter(a => a.status === 'interview').length;
  const offers     = apps.filter(a => a.status === 'offer').length;
  return {
    total:         apps.length,
    applied,
    interviews,
    offers,
    interviewRate: applied > 0 ? Math.round((interviews / applied) * 100) : 0,
    offerRate:     applied > 0 ? Math.round((offers / applied) * 100) : 0,
  };
}

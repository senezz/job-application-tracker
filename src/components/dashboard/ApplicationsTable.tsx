import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUpdateStatus, useDeleteApplication } from '../../hooks/useApplications';
import type { Application, ApplicationStatus } from '../../types';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved:     'Saved',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
};

const STATUS_VARIANTS: Record<ApplicationStatus, string> = {
  saved:     'bg-zinc-700 text-zinc-300',
  applied:   'bg-blue-900/50 text-blue-300',
  interview: 'bg-amber-900/50 text-amber-300',
  offer:     'bg-green-900/50 text-green-300',
  rejected:  'bg-red-900/50 text-red-300',
};

type TabFilter = 'all' | 'applied' | 'interview' | 'offer';

interface Props {
  apps: Application[];
}

export function ApplicationsTable({ apps }: Props) {
  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { mutate: updateStatus } = useUpdateStatus();
  const { mutate: deleteApp } = useDeleteApplication();

  const filtered = apps.filter(a => {
    if (tab !== 'all' && a.status !== tab) return false;
    const q = search.toLowerCase();
    return a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={tab} onValueChange={v => setTab(v as TabFilter)}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="offer">Offer</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search company or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Role</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(app => (
                <TableRow
                  key={app.id}
                  className="border-border group"
                  onMouseEnter={() => setHoveredId(app.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <TableCell className="font-medium text-foreground">{app.company}</TableCell>
                  <TableCell className="text-muted-foreground">{app.role}</TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={val =>
                        updateStatus({ id: app.id, status: val as ApplicationStatus })
                      }
                    >
                      <SelectTrigger className="h-7 w-32 border-0 p-0 bg-transparent focus:ring-0">
                        <SelectValue>
                          <Badge className={STATUS_VARIANTS[app.status]}>
                            {STATUS_LABELS[app.status]}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map(s => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(app.applied_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 text-muted-foreground hover:text-destructive-foreground transition-opacity ${hoveredId === app.id ? 'opacity-100' : 'opacity-0'}`}
                      onClick={() => deleteApp(app.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Trash2, Pencil, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { EditApplicationForm } from '../forms/EditApplicationForm';
import type { Application, ApplicationStatus } from '../../types';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved:     'Saved',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
};

const STATUS_ORDER: Record<ApplicationStatus, number> = {
  saved:     0,
  applied:   1,
  interview: 2,
  offer:     3,
  rejected:  4,
};

const STATUS_VARIANTS: Record<ApplicationStatus, string> = {
  saved:     'bg-zinc-700 text-zinc-300',
  applied:   'bg-blue-900/50 text-blue-300',
  interview: 'bg-amber-900/50 text-amber-300',
  offer:     'bg-green-900/50 text-green-300',
  rejected:  'bg-red-900/50 text-red-300',
};

type TabFilter = 'all' | 'applied' | 'interview' | 'offer';
type SortField = 'status' | 'date';
type SortDir = 'asc' | 'desc';

interface Props {
  apps: Application[];
}

function SortIcon({ field, sortBy, sortDir }: { field: SortField; sortBy: SortField | null; sortDir: SortDir }) {
  if (sortBy !== field) return <ChevronsUpDown size={13} className="opacity-40" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-foreground" />
    : <ChevronDown size={13} className="text-foreground" />;
}

export function ApplicationsTable({ apps }: Props) {
  const [tab, setTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { mutate: updateStatus } = useUpdateStatus();
  const { mutate: deleteApp } = useDeleteApplication();

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const filtered = apps
    .filter(a => {
      if (tab !== 'all' && a.status !== tab) return false;
      const q = search.toLowerCase();
      return a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'status') {
        return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * dir;
      }
      if (sortBy === 'date') {
        return (new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime()) * dir;
      }
      return 0;
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
          className="max-w-xs transition-shadow focus:shadow-sm"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Role</TableHead>
              <TableHead className="text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <SortIcon field="status" sortBy={sortBy} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => handleSort('date')}
                >
                  Date
                  <SortIcon field="date" sortBy={sortBy} sortDir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="w-20" />
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
              filtered.map((app, i) => (
                <TableRow
                  key={app.id}
                  className="border-border group cursor-pointer transition-colors anim-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onMouseEnter={() => setHoveredId(app.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setEditingApp(app)}
                >
                  <TableCell className="font-medium text-foreground">{app.company}</TableCell>
                  <TableCell className="text-muted-foreground">{app.role}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
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
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 text-muted-foreground hover:text-blue-400 transition-opacity duration-150 ${hoveredId === app.id ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => setEditingApp(app)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 text-muted-foreground hover:text-red-400 transition-opacity duration-150 ${hoveredId === app.id ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => setDeletingId(app.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <EditApplicationForm app={editingApp} onClose={() => setEditingApp(null)} />

      <AlertDialog open={!!deletingId} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The application will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (deletingId) deleteApp(deletingId);
                setDeletingId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

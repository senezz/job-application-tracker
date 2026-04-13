import { BriefcaseBusiness, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center anim-fade-up">
      <div className="mb-5 flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50">
        <BriefcaseBusiness size={36} className="text-muted-foreground/50" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">No applications yet</h2>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Start tracking your job search by adding your first application.
      </p>
      <Button onClick={onAdd} className="gap-2">
        <Plus size={16} />
        Add application
      </Button>
    </div>
  );
}

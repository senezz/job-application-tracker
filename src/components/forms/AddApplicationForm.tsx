import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { applicationSchema, type ApplicationFormValues } from '../../lib/validators/applicationSchema';
import { useCreateApplication } from '../../hooks/useApplications';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const today = new Date().toISOString().split('T')[0];

export function AddApplicationForm({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useCreateApplication();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      status: 'applied',
      applied_date: today,
    },
  });

  const onSubmit = async (values: ApplicationFormValues) => {
    try {
      await mutateAsync(values);
      toast.success('Application added');
      reset({ status: 'applied', applied_date: today });
      onOpenChange(false);
    } catch {
      toast.error('Failed to add application');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Input placeholder="Company" {...register('company')} />
            {errors.company && <p className="text-xs text-destructive-foreground">{errors.company.message}</p>}
          </div>
          <div className="space-y-1">
            <Input placeholder="Role" {...register('role')} />
            {errors.role && <p className="text-xs text-destructive-foreground">{errors.role.message}</p>}
          </div>
          <div className="space-y-1">
            <Select
              defaultValue="applied"
              onValueChange={val => setValue('status', val as ApplicationFormValues['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Input type="date" {...register('applied_date')} />
            {errors.applied_date && <p className="text-xs text-destructive-foreground">{errors.applied_date.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding…' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

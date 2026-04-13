import { z } from 'zod';

export const applicationSchema = z.object({
  company:      z.string().min(1, 'Required').max(100),
  role:         z.string().min(1, 'Required').max(100),
  status:       z.enum(['saved', 'applied', 'interview', 'offer', 'rejected']),
  applied_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

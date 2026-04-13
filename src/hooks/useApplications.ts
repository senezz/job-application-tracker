import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} from '../lib/api/applications';
import type { Application, CreateApplicationDTO } from '../types';

const QUERY_KEY = ['applications'];

export const useApplications = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchApplications,
  });

export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateApplicationDTO) => createApplication(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Application['status'] }) =>
      updateApplicationStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<Application[]>(QUERY_KEY);
      qc.setQueryData<Application[]>(QUERY_KEY, old =>
        old?.map(a => (a.id === id ? { ...a, status } : a)) ?? [],
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
    },
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

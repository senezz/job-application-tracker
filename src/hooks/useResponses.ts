import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchResponsesByApplicationId,
  saveResponse,
  deleteResponse,
  type SaveResponseDTO,
} from '../lib/api/responses';

export function useResponses(applicationId: string) {
  return useQuery({
    queryKey: ['responses', applicationId],
    queryFn: () => fetchResponsesByApplicationId(applicationId),
    enabled: !!applicationId,
  });
}

export function useSaveResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SaveResponseDTO) => saveResponse(dto),
    onSuccess: data => {
      qc.invalidateQueries({ queryKey: ['responses', data.application_id] });
      toast.success('Email attached');
    },
    onError: () => toast.error('Failed to attach email'),
  });
}

export function useDeleteResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; applicationId: string }) => deleteResponse(id),
    onSuccess: (_, { applicationId }) => {
      qc.invalidateQueries({ queryKey: ['responses', applicationId] });
      toast.success('Email detached');
    },
    onError: () => toast.error('Failed to detach email'),
  });
}

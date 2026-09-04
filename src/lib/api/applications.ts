import { apiFetch } from './client';
import type { Application, CreateApplicationDTO, UpdateApplicationDTO } from '../../types';

export const fetchApplications = (): Promise<Application[]> => apiFetch<Application[]>('/jobs');

export const createApplication = (dto: CreateApplicationDTO): Promise<Application> =>
  apiFetch<Application>('/jobs', {
    method: 'POST',
    body: JSON.stringify(dto),
  });

export const updateApplication = (
  id: string,
  dto: UpdateApplicationDTO,
): Promise<Application> =>
  apiFetch<Application>(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });

export const updateApplicationStatus = (
  id: string,
  status: Application['status'],
): Promise<void> =>
  apiFetch(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const deleteApplication = (id: string): Promise<void> =>
  apiFetch(`/jobs/${id}`, { method: 'DELETE' });

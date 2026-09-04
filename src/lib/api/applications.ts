import { apiFetch } from './client';
import type { Application, CreateApplicationDTO, UpdateApplicationDTO } from '../../types';

interface ApiApplication {
  id: string;
  company: string;
  role: string;
  status: Application['status'];
  appliedDate: string;
  url: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function toApplication(a: ApiApplication): Application {
  return {
    id: a.id,
    company: a.company,
    role: a.role,
    status: a.status,
    applied_date: a.appliedDate.slice(0, 10),
    url: a.url,
    notes: a.notes,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

function toApiBody(dto: CreateApplicationDTO | UpdateApplicationDTO) {
  return {
    company: dto.company,
    role: dto.role,
    status: dto.status,
    appliedDate: dto.applied_date,
    url: dto.url,
    notes: dto.notes,
  };
}

export async function fetchApplications(): Promise<Application[]> {
  const data = await apiFetch<ApiApplication[]>('/jobs');
  return data.map(toApplication);
}

export async function createApplication(dto: CreateApplicationDTO): Promise<Application> {
  const data = await apiFetch<ApiApplication>('/jobs', {
    method: 'POST',
    body: JSON.stringify(toApiBody(dto)),
  });
  return toApplication(data);
}

export async function updateApplication(
  id: string,
  dto: UpdateApplicationDTO,
): Promise<Application> {
  const data = await apiFetch<ApiApplication>(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(toApiBody(dto)),
  });
  return toApplication(data);
}

export async function updateApplicationStatus(
  id: string,
  status: Application['status'],
): Promise<void> {
  await apiFetch(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  await apiFetch(`/jobs/${id}`, { method: 'DELETE' });
}

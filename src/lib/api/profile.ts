import { apiFetch } from './client';

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string | null;
  phone: string | null;
  links: string[];
  cvKey: string | null;
  cvName: string | null;
  updatedAt: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  links?: string[];
}

export function getProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/profile');
}

export function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  return apiFetch<UserProfile>('/profile', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function uploadCv(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('cv', file);
  return apiFetch<UserProfile>('/profile/cv', {
    method: 'POST',
    body: formData,
  });
}

export function getCvUrl(): Promise<{ url: string }> {
  return apiFetch<{ url: string }>('/profile/cv');
}

export function deleteCv(): Promise<void> {
  return apiFetch<void>('/profile/cv', { method: 'DELETE' });
}

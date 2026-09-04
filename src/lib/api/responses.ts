import { apiFetch } from './client';

export interface Response {
  id: string;
  application_id: string;
  gmail_message_id: string | null;
  sender: string | null;
  subject: string | null;
  received_at: string | null;
  content: string | null;
  created_at: string;
}

export interface SaveResponseDTO {
  application_id: string;
  gmail_message_id: string;
  sender: string;
  subject: string;
  received_at: string;
  content: string;
}

interface ApiResponse {
  id: string;
  applicationId: string;
  gmailMessageId: string | null;
  sender: string | null;
  subject: string | null;
  receivedAt: string | null;
  content: string | null;
  createdAt: string;
}

function toResponse(r: ApiResponse): Response {
  return {
    id: r.id,
    application_id: r.applicationId,
    gmail_message_id: r.gmailMessageId,
    sender: r.sender,
    subject: r.subject,
    received_at: r.receivedAt,
    content: r.content,
    created_at: r.createdAt,
  };
}

export async function fetchResponsesByApplicationId(applicationId: string): Promise<Response[]> {
  const data = await apiFetch<ApiResponse[]>(`/jobs/${applicationId}/responses`);
  return data
    .map(toResponse)
    .sort((a, b) => (b.received_at ?? '').localeCompare(a.received_at ?? ''));
}

export async function saveResponse(dto: SaveResponseDTO): Promise<Response> {
  const data = await apiFetch<ApiResponse>(`/jobs/${dto.application_id}/responses`, {
    method: 'POST',
    body: JSON.stringify({
      gmailMessageId: dto.gmail_message_id,
      sender: dto.sender,
      subject: dto.subject,
      receivedAt: dto.received_at,
      content: dto.content,
    }),
  });
  return toResponse(data);
}

export async function deleteResponse(id: string): Promise<void> {
  await apiFetch(`/responses/${id}`, { method: 'DELETE' });
}

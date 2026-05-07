import { supabase } from '../supabase';

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

export async function fetchResponsesByApplicationId(applicationId: string): Promise<Response[]> {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('application_id', applicationId)
    .order('received_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function saveResponse(dto: SaveResponseDTO): Promise<Response> {
  const { data, error } = await supabase.from('responses').insert(dto).select().single();
  if (error) throw error;
  return data;
}

export async function deleteResponse(id: string): Promise<void> {
  const { error } = await supabase.from('responses').delete().eq('id', id);
  if (error) throw error;
}

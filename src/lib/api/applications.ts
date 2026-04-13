import { supabase } from '../supabase';
import type { Application, CreateApplicationDTO, UpdateApplicationDTO } from '../../types';

export const fetchApplications = async (): Promise<Application[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createApplication = async (dto: CreateApplicationDTO): Promise<Application> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('applications')
    .insert({ ...dto, user_id: user!.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateApplication = async (
  id: string,
  dto: UpdateApplicationDTO,
): Promise<Application> => {
  const { data, error } = await supabase
    .from('applications')
    .update({ ...dto, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateApplicationStatus = async (
  id: string,
  status: Application['status'],
): Promise<void> => {
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const deleteApplication = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

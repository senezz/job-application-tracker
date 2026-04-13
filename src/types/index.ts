export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  applied_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationDTO {
  company: string;
  role: string;
  status: ApplicationStatus;
  applied_date: string;
}

export interface DashboardStats {
  total: number;
  applied: number;
  interviews: number;
  offers: number;
  interviewRate: number;
  offerRate: number;
}

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  created_by?: string;
}

export interface Brand {
  id: number;
  name: string;
  created_by?: string;
}

export interface ModelItem {
  id: number;
  name: string;
  brand_id: number;
  created_by?: string;
}

export interface Computer {
  id: number;
  name: string;
  category_id?: number | null;
  brand_id?: number | null;
  model_id?: number | null;
  serial_number?: string;
  status: string;
  category_name?: string;
  brand_name?: string;
  model_name?: string;
}

export type IssueStatus = "pending" | "in_progress" | "resolved" | "closed";

export interface Issue {
  id: number;
  title: string;
  description?: string;
  computer_id?: number | null;
  status: IssueStatus;
  reported_by?: string;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  assignee_name?: string;
  computer_name?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  users?: User[];
  token?: string;
  user?: User;
  message?: string;
}

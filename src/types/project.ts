import type { User } from './auth';

export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'active' | 'on_hold';

export interface ProjectAssignment {
  id: number;
  user: User;
  user_id: number;
  assigned_at: string;
  assigned_by: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  created_by: User;
  created_at: string;
  updated_at: string;
  assignments: ProjectAssignment[];
  progress_percentage: number;
  is_overdue: boolean;
  days_remaining: number;
}

export interface ProjectListItem {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  progress_percentage: number;
  is_overdue: boolean;
  days_remaining: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  total_members: number;
  assignments?: ProjectAssignment[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: number;
  name: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: User | null;
  assigned_to_id: number | null;
  project: number;
  due_date: string;
  created_at: string;
  updated_at: string;
  created_by: User;
  is_overdue: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  created_at: string;
  updated_at: string;
}

export interface TaskComment extends Comment {
  task: number;
}

export interface CreateTaskCommentData {
  content: string;
  taskId: number;
}

export interface UpdateTaskCommentData {
  content: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  status?: ProjectStatus;
  start_date: string;
  end_date: string;
  assignments?: Array<{ user_id: number }>;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
}

export interface ProjectStats {
  total_projects: number;
  completed_projects: number;
  in_progress_projects: number;
  overdue_projects: number;
  pending_projects: number;
  cancelled_projects: number;
}

export interface ProjectDetailStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  total_members: number;
  progress_percentage: number;
  is_overdue: boolean;
  days_remaining: number;
}

export interface AssignUserToProject {
  user_id: number;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  created_by?: number;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  page?: number;
  page_size?: number;
}

export interface CreateTaskData {
  name: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to_id?: number | null;
  due_date: string;
  status?: TaskStatus;
}

export interface UpdateTaskData {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  due_date?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  assigned_to?: number;
  search?: string;
  due_date_from?: string;
  due_date_to?: string;
  page?: number;
  page_size?: number;
}

export interface TaskStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  tasks_by_status: Record<string, number>;
  tasks_by_priority: Record<string, number>;
}
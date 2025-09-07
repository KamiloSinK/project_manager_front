import { apiClient } from './apiClient';
import type { 
  Project, 
  ProjectListItem,
  CreateProjectData, 
  UpdateProjectData,
  ProjectStats,
  AssignUserToProject,
  ProjectFilters
} from '../types/project';

export const projectService = {
  // Obtener todos los proyectos con filtros opcionales
  getProjects: async (filters?: ProjectFilters): Promise<ProjectListItem[] | { results: ProjectListItem[]; count: number; next?: string; previous?: string; }> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = params.toString() ? `/projects/?${params.toString()}` : '/projects/';
    const response = await apiClient.get<ProjectListItem[] | { results: ProjectListItem[]; count: number; next?: string; previous?: string; }>(url);
    // La API devuelve una estructura paginada: { count, next, previous, results }
    return response.data;
  },

  // Obtener un proyecto por ID con detalles completos
  getProject: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}/`);
    return response.data;
  },

  // Crear un nuevo proyecto
  createProject: async (data: CreateProjectData): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects/', data);
    return response.data;
  },

  // Actualizar un proyecto completamente
  updateProject: async (id: number, data: UpdateProjectData): Promise<Project> => {
    const response = await apiClient.put<Project>(`/projects/${id}/`, data);
    return response.data;
  },

  // Actualizar un proyecto parcialmente
  patchProject: async (id: number, data: Partial<UpdateProjectData>): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${id}/`, data);
    return response.data;
  },

  // Eliminar un proyecto
  deleteProject: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}/`);
  },

  // Obtener proyectos del usuario actual
  getMyProjects: async (): Promise<ProjectListItem[]> => {
    const response = await apiClient.get<ProjectListItem[]>('/projects/my_projects/');
    return response.data;
  },

  // Obtener estadísticas del dashboard
  getDashboardStats: async (): Promise<ProjectStats> => {
    const response = await apiClient.get<ProjectStats>('/dashboard/stats/');
    return response.data;
  },

  // Obtener asignaciones de un proyecto
  getProjectAssignments: async (projectId: number) => {
    const response = await apiClient.get<any>(`/projects/${projectId}/assignments/`);
    return response.data;
  },

  // Asignar usuario a un proyecto
  assignUserToProject: async (projectId: number, data: AssignUserToProject) => {
    const response = await apiClient.post<any>(`/projects/${projectId}/assign_user/`, data);
    return response.data;
  },

  // Actualizar rol de asignación
  updateAssignment: async (projectId: number, assignmentId: number, data: { role?: string; [key: string]: unknown }) => {
    const response = await apiClient.patch<any>(`/projects/${projectId}/assignments/${assignmentId}/`, data);
    return response.data;
  },

  // Eliminar asignación
  removeAssignment: async (projectId: number, assignmentId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/assignments/${assignmentId}/`);
  },

  // Obtener tareas de un proyecto
  getProjectTasks: async (projectId: number) => {
    const response = await apiClient.get<any>(`/projects/${projectId}/tasks/`);
    return response.data;
  },

  // Obtener estadísticas de un proyecto específico
  getProjectStats: async (projectId: number) => {
    const response = await apiClient.get<any>(`/projects/${projectId}/stats/`);
    return response.data;
  },
};
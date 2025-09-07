import type { Task, CreateTaskData, UpdateTaskData, TaskFilters, TaskStats } from '../types';
import { apiClient } from './apiClient';

class TaskService {

  // Obtener tareas de un proyecto
  async getProjectTasks(projectId: number, filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.due_date_from) params.append('due_date_from', filters.due_date_from);
      if (filters.due_date_to) params.append('due_date_to', filters.due_date_to);
    }

    const queryString = params.toString();
    const url = `/projects/${projectId}/tasks/${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<Task[] | { results: Task[] }>(url);
    
    // Si la respuesta es paginada, extraer los resultados
    return Array.isArray(response.data) ? response.data : response.data.results;
  }

  // Obtener una tarea específica
  async getTask(taskId: number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${taskId}/`);
    return response.data;
  }

  // Crear una nueva tarea
  async createTask(projectId: number, taskData: CreateTaskData): Promise<Task> {
    const taskPayload = {
      ...taskData,
      project: projectId
    };

    const response = await apiClient.post<Task>(`/tasks/`, taskPayload);
    return response.data;
  }

  // Actualizar una tarea
  async updateTask(taskId: number, taskData: UpdateTaskData): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}/`, taskData);
    return response.data;
  }

  // Eliminar una tarea
  async deleteTask(taskId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/`);
  }

  // Asignar tarea a un usuario
  async assignTask(taskId: number, userId: number): Promise<Task> {
    return this.updateTask(taskId, { assigned_to: userId });
  }

  // Cambiar estado de una tarea usando el endpoint específico
  async updateTaskStatus(taskId: number, status: 'pending' | 'in_progress' | 'completed'): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}/update_status/`, { status });
    return response.data;
  }

  // Obtener estadísticas de tareas de un proyecto
  async getTaskStats(projectId: number): Promise<TaskStats> {
    const response = await apiClient.get<TaskStats>(`/projects/${projectId}/task-stats/`);
    return response.data;
  }

  // Obtener estadísticas del dashboard de tareas
  async getDashboardStats(): Promise<TaskStats> {
    const response = await apiClient.get<TaskStats>(`/tasks/dashboard_stats/`);
    return response.data;
  }
}

export const taskService = new TaskService();
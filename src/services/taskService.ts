import type { Task, CreateTaskData, UpdateTaskData, TaskFilters, TaskStats } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class TaskService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

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
    const url = `${API_BASE_URL}/projects/${projectId}/tasks/${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener las tareas del proyecto');
    }

    const data = await response.json();
    // Si la respuesta es paginada, extraer los resultados
    return data.results || data;
  }

  // Obtener una tarea específica
  async getTask(taskId: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener la tarea');
    }

    return response.json();
  }

  // Crear una nueva tarea
  async createTask(projectId: number, taskData: CreateTaskData): Promise<Task> {
    const taskPayload = {
      ...taskData,
      project: projectId
    };

    const response = await fetch(`${API_BASE_URL}/tasks/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw { response: { data: errorData } };
    }

    return response.json();
  }

  // Actualizar una tarea
  async updateTask(taskId: number, taskData: UpdateTaskData): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al actualizar la tarea');
    }

    return response.json();
  }

  // Eliminar una tarea
  async deleteTask(taskId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la tarea');
    }
  }

  // Asignar tarea a un usuario
  async assignTask(taskId: number, userId: number): Promise<Task> {
    return this.updateTask(taskId, { assigned_to: userId });
  }

  // Cambiar estado de una tarea
  async updateTaskStatus(taskId: number, status: 'pending' | 'in_progress' | 'completed'): Promise<Task> {
    return this.updateTask(taskId, { status });
  }

  // Obtener estadísticas del dashboard de tareas
  async getDashboardStats(): Promise<TaskStats> {
    const response = await fetch(`${API_BASE_URL}/tasks/dashboard_stats/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de tareas');
    }

    return response.json();
  }
}

export const taskService = new TaskService();
import { apiClient } from './apiClient';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_completed' | 'project_assigned' | 'comment_added' | 'task_updated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  read_at?: string;
  sender?: {
    id: number;
    username: string;
    full_name: string;
  };
  related_task?: {
    id: number;
    name: string;
  };
  related_project?: {
    id: number;
    name: string;
  };
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
  notifications_by_type: Record<string, number>;
  recent_notifications: Notification[];
}

class NotificationService {
  /**
   * Obtener todas las notificaciones del usuario
   */
  async getNotifications(params?: {
    type?: string;
    is_read?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{
    results: Notification[];
    count: number;
    next?: string;
    previous?: string;
  }> {
    try {
      const response = await apiClient.get<{
        results: Notification[];
        count: number;
        next?: string;
        previous?: string;
      }>('/notifications/', { params });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('No tienes permisos para ver las notificaciones.');
      }
      throw new Error('Error al cargar las notificaciones.');
    }
  }

  /**
   * Obtener notificaciones recientes (últimas 10)
   */
  async getRecentNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>('/notifications/recent/');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('No tienes permisos para ver las notificaciones.');
      }
      throw new Error('Error al cargar las notificaciones recientes.');
    }
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ unread_count: number }>('/notifications/unread_count/');
      return response.data.unread_count;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('No tienes permisos para ver las notificaciones.');
      }
      throw new Error('Error al obtener el contador de notificaciones.');
    }
  }

  /**
   * Obtener notificaciones no leídas
   */
  async getUnreadNotifications(): Promise<{
    results: Notification[];
    count: number;
    next?: string;
    previous?: string;
  }> {
    try {
      const response = await apiClient.get<{
        results: Notification[];
        count: number;
        next?: string;
        previous?: string;
      }>('/notifications/unread/');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('No tienes permisos para ver las notificaciones.');
      }
      throw new Error('Error al cargar las notificaciones no leídas.');
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await apiClient.get<NotificationStats>('/notifications/stats/');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('No tienes permisos para ver las estadísticas.');
      }
      throw new Error('Error al cargar las estadísticas de notificaciones.');
    }
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/mark_as_read/`);
      return response.data;
    } catch (error: unknown) {
      const errorResponse = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { status?: number } }).response : null;
      if (errorResponse?.status === 404) {
        throw new Error('Notificación no encontrada.');
      }
      if (errorResponse?.status === 403) {
        throw new Error('No tienes permisos para modificar esta notificación.');
      }
      throw new Error('Error al marcar la notificación como leída.');
    }
  }

  /**
   * Marcar una notificación como no leída
   */
  async markAsUnread(notificationId: number): Promise<Notification> {
    try {
      const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/mark_as_unread/`);
      return response.data;
    } catch (error: unknown) {
      const errorResponse = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { status?: number } }).response : null;
      if (errorResponse?.status === 404) {
        throw new Error('Notificación no encontrada.');
      }
      if (errorResponse?.status === 403) {
        throw new Error('No tienes permisos para modificar esta notificación.');
      }
      throw new Error('Error al marcar la notificación como no leída.');
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<{ updated_count: number }> {
    try {
      const response = await apiClient.patch<{ updated_count: number }>('/notifications/mark_all_as_read/');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('No tienes permisos para modificar las notificaciones.');
      }
      throw new Error('Error al marcar todas las notificaciones como leídas.');
    }
  }

  /**
   * Eliminar notificaciones leídas
   */
  async deleteReadNotifications(): Promise<{ deleted_count: number }> {
    try {
      const response = await apiClient.delete<{ deleted_count: number }>('/notifications/delete_read/');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('No tienes permisos para eliminar las notificaciones.');
      }
      throw new Error('Error al eliminar las notificaciones leídas.');
    }
  }

  /**
   * Eliminar notificaciones antiguas (más de 30 días)
   */
  async deleteOldNotifications(): Promise<{ deleted_count: number }> {
    try {
      const response = await apiClient.delete<{ deleted_count: number }>('/notifications/delete_old/');
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('No tienes permisos para eliminar las notificaciones.');
      }
      throw new Error('Error al eliminar las notificaciones antiguas.');
    }
  }

  /**
   * Eliminar una notificación específica
   */
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}/`);
    } catch (error: unknown) {
      const errorResponse = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { status?: number } }).response : null;
      if (errorResponse?.status === 404) {
        throw new Error('Notificación no encontrada.');
      }
      if (errorResponse?.status === 403) {
        throw new Error('No tienes permisos para eliminar esta notificación.');
      }
      throw new Error('Error al eliminar la notificación.');
    }
  }

  /**
   * Polling para obtener nuevas notificaciones
   * Útil para simular tiempo real sin WebSockets
   */
  startPolling(callback: (notifications: Notification[]) => void, interval: number = 30000) {
    const pollInterval = setInterval(async () => {
      try {
        const notifications = await this.getRecentNotifications();
        callback(notifications);
      } catch (error) {
        console.error('Error en polling de notificaciones:', error);
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }

  /**
   * Obtener el tipo de icono para una notificación
   */
  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'task_assigned': '📋',
      'task_completed': '✅',
      'project_assigned': '📁',
      'comment_added': '💬',
      'task_updated': '🔄'
    };
    return icons[type] || '📢';
  }

  /**
   * Obtener el color para el tipo de prioridad
   */
  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'urgent': '#dc2626'
    };
    return colors[priority] || '#6b7280';
  }
}

export default new NotificationService();
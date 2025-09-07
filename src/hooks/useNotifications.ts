import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import type { Notification } from '../services/notificationService';

interface UseNotificationsParams {
  page?: number;
  is_read?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNotifications(params: UseNotificationsParams = {}) {
  const {
    page = 1,
    is_read,
    autoRefresh = false,
    refreshInterval = 30000 // 30 segundos por defecto
  } = params;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    current_page: 1,
    total_pages: 1
  });

  // Función para obtener notificaciones
  const fetchNotifications = useCallback(async (pageNum: number = page) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (is_read === false) {
        // Obtener solo notificaciones no leídas
        response = await notificationService.getUnreadNotifications();
      } else {
        // Obtener todas las notificaciones con filtros
        const filters: any = { page: pageNum };
        if (is_read !== undefined) {
          filters.is_read = is_read;
        }
        response = await notificationService.getNotifications(filters);
      }
      
      setNotifications(response.results);
      setPagination({
        count: response.count,
        next: response.next || null,
        previous: response.previous || null,
        current_page: pageNum,
        total_pages: Math.ceil(response.count / 10) // Asumiendo 10 items por página
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [page, is_read]);

  // Función para obtener el conteo de notificaciones no leídas
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err: unknown) {
      console.error('Error loading unread count:', err);
    }
  }, []);

  // Función para marcar una notificación como leída
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      
      // Actualizar el conteo de no leídas
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Error al marcar como leída');
    }
  }, []);

  // Función para marcar una notificación como no leída
  const markAsUnread = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsUnread(notificationId);
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: false, read_at: undefined }
            : notif
        )
      );
      
      // Actualizar el conteo de no leídas
      setUnreadCount(prev => prev + 1);
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Error al marcar como no leída');
    }
  }, []);

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Error al marcar todas como leídas');
    }
  }, []);

  // Función para eliminar una notificación
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Actualizar el estado local
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Si la notificación eliminada no estaba leída, actualizar el conteo
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'Error al eliminar notificación');
    }
  }, [notifications]);

  // Función para refrescar las notificaciones
  const refresh = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Efecto para cargar notificaciones iniciales
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Efecto para auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    refresh
  };
}

// Hook específico para obtener solo notificaciones no leídas
export function useUnreadNotifications(autoRefresh: boolean = true) {
  return useNotifications({
    is_read: false,
    autoRefresh,
    refreshInterval: 15000 // 15 segundos para notificaciones no leídas
  });
}

// Hook para obtener el conteo de notificaciones no leídas globalmente
export function useUnreadCount() {
  const { state: authState } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err: unknown) {
      console.error('Error loading unread count:', err);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    
    // Auto-refresh cada 30 segundos solo si está autenticado
    if (!authState.isAuthenticated) return;
    
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount, authState.isAuthenticated]);

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount
  };
}
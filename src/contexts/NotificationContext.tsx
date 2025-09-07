import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUnreadCount } from '../hooks/useNotifications';
import { useAuth } from './AuthContext';


interface NotificationContextType {
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => void;
  checkForNewNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { state: authState } = useAuth();
  const { unreadCount, loading, refresh } = useUnreadCount();
  const location = useLocation();
  const lastLocationRef = useRef(location.pathname);
  const lastCheckRef = useRef<number>(Date.now());
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Función para verificar nuevas notificaciones
  const checkForNewNotifications = async () => {
    try {
      // No consultar notificaciones si el usuario no está autenticado o está en una ruta pública
      if (!authState.isAuthenticated || isPublicRoute) {
        return;
      }
      
      // Solo verificar si han pasado al menos 5 segundos desde la última verificación
      const now = Date.now();
      if (now - lastCheckRef.current < 5000) {
        return;
      }
      
      lastCheckRef.current = now;
      await refresh();
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  };

  // Efecto para verificar notificaciones en cambios de ruta
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Si la ruta cambió, verificar notificaciones
    if (lastLocationRef.current !== currentPath) {
      lastLocationRef.current = currentPath;
      
      // Pequeño delay para evitar múltiples llamadas rápidas
      const timeoutId = setTimeout(() => {
        checkForNewNotifications();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname]);

  // Efecto para verificar notificaciones cuando la ventana recupera el foco
  useEffect(() => {
    const handleFocus = () => {
      checkForNewNotifications();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForNewNotifications();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Efecto para polling periódico (cada 2 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    unreadCount,
    loading,
    refreshNotifications: refresh,
    checkForNewNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

// Hook para usar en componentes que necesitan mostrar el conteo de notificaciones
export function useGlobalUnreadCount() {
  const { unreadCount, loading } = useNotificationContext();
  const { state: authState } = useAuth();
  
  // Si no está autenticado, devolver valores por defecto
  if (!authState.isAuthenticated) {
    return { unreadCount: 0, loading: false };
  }
  
  return { unreadCount, loading };
}

// Hook para refrescar notificaciones manualmente
export function useRefreshNotifications() {
  const { refreshNotifications, checkForNewNotifications } = useNotificationContext();
  return { refreshNotifications, checkForNewNotifications };
}
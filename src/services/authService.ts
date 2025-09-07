import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';
import { apiClient } from './apiClient';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
      const data = response.data;
      
      // Guardar tokens y usuario en localStorage
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error en el login';
      throw new Error(errorMessage);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      await apiClient.post('/auth/register/', data);
      // Después del registro exitoso, hacer login automático
      return this.login({ email: data.email, password: data.password });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error en el registro';
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    try {
      const response = await apiClient.get<User>('/auth/profile/');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expirado, intentar refrescar
        await this.refreshToken();
        return this.getCurrentUser();
      }
      throw new Error('Error al obtener el usuario');
    }
  }

  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No hay refresh token');
    }

    try {
      const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      localStorage.setItem('token', response.data.access);
    } catch (error) {
      // Refresh token inválido, limpiar localStorage
      this.logout();
      throw new Error('Sesión expirada');
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout/', {
          refresh: refreshToken
        });
      } catch (error) {
        console.error('Error al hacer logout en el servidor:', error);
      }
    }
    
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async getUsers(): Promise<User[]> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    try {
      const response = await apiClient.get<{ results: User[] }>('/auth/users/');
      // El endpoint retorna una respuesta paginada, extraemos solo los usuarios
      return response.data.results || [];
    } catch (error) {
      throw new Error('Error al obtener usuarios');
    }
  }
}

export const authService = new AuthService();
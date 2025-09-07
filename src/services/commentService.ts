import { apiClient as api } from './apiClient';
import type { TaskComment, CreateTaskCommentData, UpdateTaskCommentData } from '../types/project';

export const commentService = {


  // Obtener comentarios de una tarea específica
  getTaskComments: async (taskId: number): Promise<TaskComment[]> => {
    const response = await api.get<TaskComment[]>(`/tasks/${taskId}/comments/`);
    return response.data;
  },

  // Crear un nuevo comentario en una tarea
  createComment: async (commentData: CreateTaskCommentData): Promise<TaskComment> => {
    try {
      const { taskId, ...data } = commentData;
      const response = await api.post<TaskComment>(`/tasks/${taskId}/add_comment/`, data);
      return response.data;
    } catch (error: unknown) {
      // Enhanced error handling for comment creation
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number; data?: { error?: string } } };
        if (errorResponse.response?.status === 400 && errorResponse.response?.data?.error) {
          throw new Error(errorResponse.response.data.error);
        }
      }
      throw error;
    }
  },



  // Actualizar un comentario
  updateComment: async (commentId: number, commentData: UpdateTaskCommentData): Promise<TaskComment> => {
    try {
      const response = await api.patch<TaskComment>(`/tasks/comments/${commentId}/`, commentData);
      return response.data;
    } catch (error: unknown) {
      // Enhanced error handling for comment updates
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 403) {
          throw new Error('No tienes permisos para editar este comentario');
        } else if (errorResponse.response?.status === 404) {
          throw new Error('Comentario no encontrado');
        }
      }
      throw error;
    }
  },

  // Eliminar un comentario
  deleteComment: async (commentId: number): Promise<void> => {
    try {
      await api.delete(`/tasks/comments/${commentId}/`);
    } catch (error: unknown) {
      // Enhanced error handling for comment deletion
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse.response?.status === 403) {
          throw new Error('No tienes permisos para eliminar este comentario');
        } else if (errorResponse.response?.status === 404) {
          throw new Error('Comentario no encontrado');
        }
      }
      throw error;
    }
  },
};

export default commentService;
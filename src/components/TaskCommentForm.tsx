import React, { useState } from 'react';
import { Button } from './ui';
import { commentService } from '../services/commentService';
import type { CreateTaskCommentData, TaskComment } from '../types/project';

interface TaskCommentFormProps {
  taskId: number;
  onCommentAdded: (comment: TaskComment) => void;
  disabled?: boolean;
}

export const TaskCommentForm: React.FC<TaskCommentFormProps> = ({
  taskId,
  onCommentAdded,
  disabled = false
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const maxLength = 1000;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const commentData: CreateTaskCommentData = {
        content: content.trim(),
        taskId: taskId
      };

      const newComment = await commentService.createComment(commentData);
      onCommentAdded(newComment);
      setContent('');
    } catch (err: unknown) {
      console.error('Error al crear comentario:', err);
      
      // Enhanced error handling
      let errorMessage = 'Error al crear el comentario';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: { error?: string; content?: string | string[] } } };
        if (error.response?.status === 404) {
          errorMessage = 'Tarea no encontrada o sin permisos para comentar';
        } else if (error.response?.status === 400) {
          if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response?.data?.content) {
            errorMessage = Array.isArray(error.response.data.content) 
              ? error.response.data.content[0] 
              : error.response.data.content;
          } else {
            errorMessage = 'Datos del comentario inválidos';
          }
        } else if (error.response?.status === 403) {
          errorMessage = 'No tienes permisos para comentar en esta tarea';
        } else if (error.response?.status === 500) {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde';
        } else if (!error.response) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Error al crear comentario</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div className="relative">
        <textarea
          placeholder="Escribe tu comentario..."
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              setContent(e.target.value);
              setError(null); // Clear error when user starts typing
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={isFocused ? 4 : 3}
          maxLength={maxLength}
          disabled={disabled || loading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-all duration-200 ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          } ${
            disabled || loading 
              ? 'bg-gray-50 cursor-not-allowed' 
              : 'bg-white'
          }`}
        />
        
        {/* Character counter */}
        <div className={`absolute bottom-2 right-2 text-xs transition-colors duration-200 ${
          remainingChars < 50 
            ? 'text-red-500' 
            : remainingChars < 100 
              ? 'text-yellow-600' 
              : 'text-gray-400'
        }`}>
          {remainingChars}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {/* Success feedback */}
        <div className="flex items-center gap-2">
          {content.trim() && !error && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Listo para enviar</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {content.trim() && (
            <Button
              onClick={() => {
                setContent('');
                setError(null);
              }}
              disabled={loading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            >
              Limpiar
            </Button>
          )}
          
          <Button
            onClick={handleSubmit}
            disabled={disabled || loading || !content.trim() || remainingChars < 0}
            className={`flex items-center gap-2 transition-all duration-200 ${
              !content.trim() || remainingChars < 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span>Agregar comentario</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskCommentForm;
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent, Button } from './ui';
import { commentService } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import TaskCommentForm from './TaskCommentForm';
import CommentList from './CommentList';
import type { TaskComment } from '../types/project';

interface TaskCommentsProps {
  taskId: number;
  userRole: 'administrator' | 'collaborator' | 'viewer';
  canComment?: boolean;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({
  taskId,
  userRole,
  canComment = true
}) => {
  const { state: {user} } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const commentsData = await commentService.getTaskComments(taskId);
      setComments(commentsData);
    } catch (err: unknown) {
      console.error('Error al cargar comentarios:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cargar los comentarios'
        : 'Error al cargar los comentarios';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadComments();
  }, [taskId, loadComments]);

  const handleCommentAdded = (newComment: TaskComment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const handleCommentUpdated = (updatedComment: TaskComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleCommentDeleted = (commentId: number) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h4 className="text-lg font-semibold">Comentarios</h4>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {comments.length}
              </span>
            </div>
            
            <Button
              onClick={toggleCollapse}
              className="flex items-center gap-1 text-sm"
            >
              {isOpen ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Ocultar
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Mostrar
                </>
              )}
            </Button>
          </div>
      </CardHeader>

      {isOpen && (
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Formulario para agregar comentarios */}
              {canComment && (
                <>
                  <div>
                    <h6 className="text-sm font-medium mb-3">Agregar comentario</h6>
                    <TaskCommentForm
                      taskId={taskId}
                      onCommentAdded={handleCommentAdded}
                      disabled={!canComment}
                    />
                  </div>
                  
                  {comments.length > 0 && <hr className="my-4 border-gray-200" />}
                </>
              )}

              {/* Lista de comentarios */}
              <div>
                {comments.length > 0 && (
                  <h6 className="text-sm font-medium mb-3">
                    Comentarios ({comments.length})
                  </h6>
                )}
                
                <CommentList
                  comments={comments}
                  onCommentUpdated={handleCommentUpdated}
                  onCommentDeleted={handleCommentDeleted}
                  userRole={userRole}
                />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default TaskComments;
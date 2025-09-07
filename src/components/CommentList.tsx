import React, { useState } from 'react';
import { Card, CardContent, Button } from './ui';
import { commentService } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import type { TaskComment } from '../types';

interface CommentItemProps {
  comment: TaskComment;
  userRole: 'administrator' | 'collaborator' | 'viewer';
  onUpdate: (updatedComment: TaskComment) => void;
  onDelete: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  userRole,
  onUpdate,
  onDelete,
}) => {
  const { state: {user} } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canEdit = user?.id === comment.author.id || userRole === 'administrator';
  const canDelete = user?.id === comment.author.id || userRole === 'administrator';

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setLoading(true);
    setError(null);

    // Actualización optimista: actualizar la UI inmediatamente
    const optimisticComment = {
      ...comment,
      content: editContent.trim(),
      updated_at: new Date().toISOString()
    };
    
    // Actualizar la UI inmediatamente
    onUpdate(optimisticComment);
    setIsEditing(false);

    try {
      // Sincronizar con el servidor
      const updatedComment = await commentService.updateComment(comment.id, {
        content: editContent.trim(),
      });
      
      // Actualizar con la respuesta real del servidor
      onUpdate(updatedComment);
    } catch {
      // Si hay error, revertir al estado original
      onUpdate(comment);
      setIsEditing(true);
      setError('Error al actualizar el comentario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await commentService.deleteComment(comment.id);
      setShowDeleteModal(false);
      onDelete();
    } catch {
      setError('Error al eliminar el comentario');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className="mb-3">
        <CardContent>
          <div className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {comment.author.first_name?.[0] || comment.author.username[0]}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">
                      {comment.author.first_name && comment.author.last_name
                        ? `${comment.author.first_name} ${comment.author.last_name}`
                        : comment.author.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                      {comment.updated_at !== comment.created_at && ' (editado)'}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleEdit}
                          disabled={loading || !editContent.trim()}
                          className="flex items-center gap-1 text-xs px-2 py-1"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Guardar
                        </Button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="flex items-center gap-1 text-xs px-2 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>

              {!isEditing && (canEdit || canDelete) && (
                <div className="flex gap-1">
                  {canEdit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      disabled={loading}
                      className="p-1 text-gray-500 hover:text-blue-600 rounded"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={loading}
                      className="p-1 text-gray-500 hover:text-red-600 rounded"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Eliminar comentario</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <Button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface CommentListProps {
  comments: TaskComment[];
  onCommentUpdated: (updatedComment: TaskComment) => void;
  onCommentDeleted: (commentId: number) => void;
  userRole: 'administrator' | 'collaborator' | 'viewer';
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  onCommentUpdated,
  onCommentDeleted,
  userRole
}) => {
  if (comments.length === 0) {
    return (
      <Card className="text-center">
        <CardContent>
          <p className="text-gray-500 text-sm">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          userRole={userRole}
          onUpdate={(updatedComment) => onCommentUpdated(updatedComment)}
          onDelete={() => onCommentDeleted(comment.id)}
        />
      ))}
    </div>
  );
};

export default CommentList;
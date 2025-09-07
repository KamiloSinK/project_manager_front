import React, { useState } from 'react';
import type { Task, TaskStatus } from '../types';
import { taskService } from '../services/taskService';
import { Button } from './ui';
import { Card } from './ui';
import { useAuth } from '../contexts/AuthContext';
import TaskComments from './TaskComments';
import TaskStatusChanger from './TaskStatusChanger';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: () => void;
  onTaskDelete: () => void;
  onEditTask: (task: Task) => void;
  canManageTasks: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTaskUpdate,
  onTaskDelete,
  onEditTask,
  canManageTasks
}) => {
  const { state: { user } } = useAuth();
  const [loading, setLoading] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200'
  };

  const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completado'
  };



  const handleDelete = async () => {
    if (!canManageTasks || !window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      setLoading(true);
      await taskService.deleteTask(task.id);
      onTaskDelete();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = task.is_overdue && task.status !== 'completed';
  const dueDate = new Date(task.due_date);
  const isToday = dueDate.toDateString() === new Date().toDateString();

  return (
    <Card className={`p-4 transition-all duration-200 hover:shadow-md ${
      isOverdue ? 'border-red-200 bg-red-50' : 'bg-white'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{task.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          
          {/* Estado */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {statusLabels[task.status]}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Vencida
              </span>
            )}
            {isToday && !isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Vence hoy
              </span>
            )}
          </div>

          {/* Información adicional */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-4">
              <span>
                <strong>Vencimiento:</strong> {dueDate.toLocaleDateString('es-ES')}
              </span>
              {task.assigned_to && (
                <span>
                  <strong>Asignado a:</strong> {task.assigned_to.full_name}
                </span>
              )}
            </div>
            <div>
              <strong>Creado por:</strong> {task.created_by.full_name} el {new Date(task.created_at).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        {/* Acciones */}
        {canManageTasks && (
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditTask(task)}
              disabled={loading}
              className="p-1 h-8 w-8"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        )}
      </div>

      {/* Cambio de estado - Disponible para cualquier usuario */}
      <TaskStatusChanger
        task={task}
        onStatusChange={onTaskUpdate}
        compact={true}
      />

      {/* Comentarios de la tarea */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <TaskComments
          taskId={task.id}
          userRole={user?.role === 'admin' ? 'administrator' : user?.role === 'collaborator' ? 'collaborator' : 'viewer'}
          canComment={user?.role === 'admin' || user?.role === 'collaborator' || user?.role === 'viewer'}
        />
      </div>
    </Card>
  );
};

export default TaskCard;
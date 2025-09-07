import React, { useState } from 'react';
import { Button } from './ui';
import { taskService } from '../services/taskService';
import type { Task, TaskStatus } from '../types';

interface TaskStatusChangerProps {
  task: Task;
  onStatusChange: () => void;
  compact?: boolean;
}

const TaskStatusChanger: React.FC<TaskStatusChangerProps> = ({ 
  task, 
  onStatusChange, 
  compact = false 
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const statusConfig = {
    pending: {
      label: 'Pendiente',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      textColor: 'text-yellow-600',
      bgColor: 'hover:bg-yellow-50',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    in_progress: {
      label: 'En Progreso',
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    completed: {
      label: 'Completado',
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-green-600',
      bgColor: 'hover:bg-green-50',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;

    try {
      setLoading(newStatus);
      await taskService.changeTaskStatus(task.id, newStatus);
      onStatusChange();
    } catch (error) {
      console.error('Error updating task status:', error);
      // Aquí podrías mostrar un toast o notificación de error
    } finally {
      setLoading(null);
    }
  };

  const availableStatuses: TaskStatus[] = ['pending', 'in_progress', 'completed'];

  if (compact) {
    // Versión compacta para usar en TaskCard
    return (
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        {task.status === 'pending' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('in_progress')}
            disabled={loading !== null}
            className="text-blue-600 hover:bg-blue-50"
          >
            {loading === 'in_progress' ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              statusConfig.in_progress.icon
            )}
            <span className="ml-1">Iniciar</span>
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('completed')}
            disabled={loading !== null}
            className="text-green-600 hover:bg-green-50"
          >
            {loading === 'completed' ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              statusConfig.completed.icon
            )}
            <span className="ml-1">Completar</span>
          </Button>
        )}
        {task.status !== 'pending' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('pending')}
            disabled={loading !== null}
            className="text-yellow-600 hover:bg-yellow-50"
          >
            {loading === 'pending' ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              statusConfig.pending.icon
            )}
            <span className="ml-1">Pendiente</span>
          </Button>
        )}
      </div>
    );
  }

  // Versión completa para usar como componente independiente
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Cambiar Estado de la Tarea
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {availableStatuses.map((status) => {
          const config = statusConfig[status];
          const isCurrentStatus = task.status === status;
          const isLoading = loading === status;
          
          return (
            <Button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isCurrentStatus || loading !== null}
              className={`
                ${isCurrentStatus 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : `${config.color} text-white`
                }
                text-sm py-2 px-4 transition-all duration-200 justify-start
              `}
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                config.icon
              )}
              <span className="ml-2">{config.label}</span>
              {isCurrentStatus && (
                <span className="ml-2 text-xs">(Actual)</span>
              )}
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Cualquier miembro del proyecto puede cambiar el estado de las tareas.
      </p>
    </div>
  );
};

export default TaskStatusChanger;
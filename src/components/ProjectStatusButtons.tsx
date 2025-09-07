import React, { useState } from 'react';
import { Button } from './ui';
import { projectService } from '../services/projectService';
import type { Project, ProjectStatus } from '../types';
import { usePermissions } from '../hooks/usePermissions';

interface ProjectStatusButtonsProps {
  project: Project;
  onStatusChange: () => void;
}

const ProjectStatusButtons: React.FC<ProjectStatusButtonsProps> = ({ project, onStatusChange }) => {
  const { isAdmin, isCollaborator, canEditProject } = usePermissions();
  const [loading, setLoading] = useState<string | null>(null);

  // Solo administradores y colaboradores pueden cambiar el estado del proyecto
  const canChangeStatus = (isAdmin() || isCollaborator()) && canEditProject?.(project);

  if (!canChangeStatus) {
    return null;
  }

  const statusConfig = {
    pending: {
      label: 'Pendiente',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    in_progress: {
      label: 'En Progreso',
      color: 'bg-blue-500 hover:bg-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    completed: {
      label: 'Completado',
      color: 'bg-green-500 hover:bg-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    cancelled: {
      label: 'Cancelado',
      color: 'bg-red-500 hover:bg-red-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    active: {
      label: 'Activo',
      color: 'bg-green-500 hover:bg-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    on_hold: {
      label: 'En Pausa',
      color: 'bg-orange-500 hover:bg-orange-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (newStatus === project.status) return;

    try {
      setLoading(newStatus);
      await projectService.patchProject(project.id, { status: newStatus });
      onStatusChange();
    } catch (error) {
      console.error('Error updating project status:', error);
      // Aquí podrías mostrar un toast o notificación de error
    } finally {
      setLoading(null);
    }
  };

  const availableStatuses: ProjectStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Cambiar Estado del Proyecto
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {availableStatuses.map((status) => {
          const config = statusConfig[status];
          const isCurrentStatus = project.status === status;
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
                text-xs py-2 px-3 transition-all duration-200
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
                <span className="ml-1 text-xs">(Actual)</span>
              )}
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Solo administradores y colaboradores pueden cambiar el estado del proyecto.
      </p>
    </div>
  );
};

export default ProjectStatusButtons;
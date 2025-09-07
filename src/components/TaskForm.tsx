import React, { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskData, UpdateTaskData, User, TaskStatus, Project } from '../types';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { Button, Input, Textarea, Select, Modal } from './ui';

import { usePermissions } from '../hooks/usePermissions';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSaved: () => void;
  projectId: number;
  task?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onTaskSaved,
  projectId,
  task
}) => {

  const { isCollaborator } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [formData, setFormData] = useState<CreateTaskData | UpdateTaskData>({
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assigned_to_id: null,
    due_date: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await authService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadProject = useCallback(async () => {
    try {
      setLoadingProject(true);
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoadingProject(false);
    }
  }, [projectId]);

  // Cargar usuarios disponibles y proyecto
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadProject();
    }
  }, [isOpen, projectId, loadProject]);

  // Cargar datos de la tarea si estamos editando
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority || 'medium',
        assigned_to_id: task.assigned_to_id,
        due_date: task.due_date.split('T')[0] // Formato YYYY-MM-DD
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assigned_to_id: null,
        due_date: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'La fecha de vencimiento es requerida';
    } else {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Validar que no sea anterior a hoy
      if (dueDate < today) {
        newErrors.due_date = 'La fecha de vencimiento no puede ser anterior a la fecha actual';
      }
      
      // Validar contra las fechas del proyecto
      if (project) {
        const projectStartDate = new Date(project.start_date);
        const projectEndDate = new Date(project.end_date);
        
        if (dueDate < projectStartDate) {
          newErrors.due_date = 'La fecha de vencimiento no puede ser anterior al inicio del proyecto';
        } else if (dueDate > projectEndDate) {
          newErrors.due_date = 'La fecha de vencimiento no puede ser posterior al fin del proyecto';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (task) {
        // Editar tarea existente
        await taskService.updateTask(task.id, formData as UpdateTaskData);
      } else {
        // Crear nueva tarea
        await taskService.createTask(projectId, formData as CreateTaskData);
      }
      
      onTaskSaved();
      onClose();
    } catch (error: unknown) {
      console.error('Error saving task:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: Record<string, string> } };
        if (apiError.response?.data) {
          setErrors(apiError.response.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assigned_to_id: null,
      due_date: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={task ? 'Editar Tarea' : 'Nueva Tarea'}>
      {/* Información del proyecto */}
      {project && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <h3 className="text-base font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'active' ? 'Activo' :
                     project.status === 'completed' ? 'Completado' :
                     project.status === 'on_hold' ? 'En Pausa' :
                     project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  La tarea se asignará a este proyecto
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {loadingProject && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-600">Cargando información del proyecto...</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nombre de la tarea"
            className={errors.name ? 'border-red-300' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descripción de la tarea"
            rows={3}
            className={errors.description ? 'border-red-300' : ''}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <Select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)}
            options={statusOptions}
            className={errors.status ? 'border-red-300' : ''}
          />
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>

        {/* Prioridad */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <Select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            options={priorityOptions}
            className={errors.priority ? 'border-red-300' : ''}
          />
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
          )}
        </div>

        {/* Asignado a */}
        <div>
          <label htmlFor="assigned_to_id" className="block text-sm font-medium text-gray-700 mb-1">
            Asignado a
            {isCollaborator() && (
              <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>
            )}
          </label>
          <Select
            id="assigned_to_id"
            value={(formData as CreateTaskData).assigned_to_id?.toString() || ''}
            onChange={(e) => handleInputChange('assigned_to_id' as keyof typeof formData, e.target.value ? parseInt(e.target.value) : 0)}
            disabled={loadingUsers || isCollaborator()}
            options={[
              { value: '', label: 'Sin asignar' },
              ...users.map(user => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name} (${user.email})`
              }))
            ]}
            className={errors.assigned_to_id ? 'border-red-300' : ''}
          />
          {loadingUsers && (
            <p className="mt-1 text-sm text-gray-500">Cargando usuarios...</p>
          )}
          {isCollaborator() && (
            <p className="mt-1 text-sm text-blue-600">Los colaboradores pueden ver las asignaciones pero no modificarlas</p>
          )}
          {errors.assigned_to_id && (
            <p className="mt-1 text-sm text-red-600">{errors.assigned_to_id}</p>
          )}
        </div>

        {/* Fecha de vencimiento */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de vencimiento *
          </label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleInputChange('due_date', e.target.value)}
            min={project ? 
              new Date(Math.max(
                new Date().getTime(),
                new Date(project.start_date).getTime()
              )).toISOString().split('T')[0] :
              new Date().toISOString().split('T')[0]
            }
            max={project ? project.end_date : undefined}
            className={errors.due_date ? 'border-red-300' : ''}
          />
          {errors.due_date && (
            <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
          )}
        </div>

        {/* Confirmación de asignación al proyecto */}
        {project && (
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  ✓ Esta tarea se {task ? 'actualizará en' : 'creará en'} el proyecto: <span className="font-semibold">{project.name}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !project}
            className={`${!project ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            title={!project ? 'Esperando información del proyecto...' : ''}
          >
            {loading ? 'Guardando...' : (task ? `Actualizar en ${project?.name || 'proyecto'}` : `Crear en ${project?.name || 'proyecto'}`)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
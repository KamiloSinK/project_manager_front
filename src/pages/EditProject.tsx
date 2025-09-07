import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import type { Project, UpdateProjectData } from '../types';
import { Button } from '../components/ui';
import { Input } from '../components/ui';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import ProjectAssignments from '../components/ProjectAssignments';
import TaskList from '../components/TaskList';

interface FormErrors {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useAuth();
  const { canAssignUsersToProject } = usePermissions();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<UpdateProjectData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'pending'
  });

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const fetchProject = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await projectService.getProject(parseInt(id));
      setProject(data);
      
      // Cargar datos en el formulario
      setFormData({
        name: data.name,
        description: data.description || '',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status
      });
    } catch (err) {
      console.error('Error fetching project:', err);
      navigate('/projects', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData?.name?.trim()) {
      newErrors.name = 'El nombre del proyecto es obligatorio';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar descripción
    if (!formData?.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    // Validar fecha de inicio
    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es obligatoria';
    }

    // Validar fecha de fin
    if (!formData.end_date) {
      newErrors.end_date = 'La fecha de fin es obligatoria';
    } else if (formData.start_date && formData.end_date <= formData.start_date) {
      newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    // Validar estado
    if (!formData.status) {
      newErrors.status = 'El estado es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !project) {
      return;
    }

    try {
      setSaving(true);
      
      // Solo enviar campos que han cambiado
      const changedData: Partial<UpdateProjectData> = {};
      
      if (formData.name !== project.name) {
        changedData.name = formData.name;
      }
      if (formData.description !== project.description) {
        changedData.description = formData.description;
      }
      if (formData.status !== project.status) {
        changedData.status = formData.status;
      }
      if (formData.start_date !== project.start_date) {
        changedData.start_date = formData.start_date;
      }
      if (formData.end_date !== project.end_date) {
        changedData.end_date = formData.end_date;
      }
      
      // Si no hay cambios, no hacer nada
      if (Object.keys(changedData).length === 0) {
        navigate(`/projects/${project.id}`, { replace: true });
        return;
      }
      
      const updatedProject = await projectService.patchProject(project.id, changedData);
      navigate(`/projects/${updatedProject.id}`, { replace: true });
    } catch (err: unknown) {
      console.error('Error updating project:', err);
      
      // Manejar errores del servidor
      if ((err as { response?: { data?: Record<string, unknown> } }).response?.data) {
        const serverErrors: FormErrors = {};
        Object.keys((err as { response: { data: Record<string, unknown> } }).response.data).forEach(key => {
          if (key in formData) {
            const errorData = (err as { response: { data: Record<string, unknown> } }).response.data;
            serverErrors[key as keyof FormErrors] = Array.isArray(errorData[key]) 
              ? (errorData[key] as string[])[0] 
              : errorData[key] as string;
          }
        });
        setErrors(serverErrors);
      } else {
        setErrors({ name: 'Error al actualizar el proyecto. Inténtalo de nuevo.' });
      }
    } finally {
      setSaving(false);
    }
  };

  // Verificar permisos
  const canEdit = user?.role === 'admin' || project?.created_by === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project || !canEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes permisos para editar este proyecto
              </h3>
              <p className="text-gray-600 mb-6">
                Solo el creador del proyecto o un administrador pueden editarlo.
              </p>
              <Link to="/projects">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  Volver a Proyectos
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to={`/projects/${project.id}`}>
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Proyecto
              </h1>
              <p className="text-gray-600 mt-1">
                Modifica la información del proyecto: {project.name}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del proyecto */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proyecto *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Sistema de Gestión de Inventario"
                error={errors.name}
                className="w-full"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe los objetivos y alcance del proyecto..."
                className={`w-full px-4 py-3 bg-white/95 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-medium resize-none ${
                  errors.description 
                    ? 'border-red-300 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50' 
                    : 'border-gray-200/50 hover:bg-white focus:bg-white'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  error={errors.start_date}
                  className="w-full"
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                )}
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date}
                  error={errors.end_date}
                  className="w-full"
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Estado del Proyecto *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/95 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 font-medium ${
                  errors.status 
                    ? 'border-red-300 focus:ring-red-500/30 focus:border-red-500 bg-red-50/50' 
                    : 'border-gray-200/50 hover:bg-white focus:bg-white'
                }`}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Información del proyecto */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Información del proyecto:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Creado por: {project.created_by.first_name}</li>
                    <li>Fecha de creación: {new Date(project.created_at).toLocaleDateString('es-ES')}</li>
                    <li>Progreso actual: {project.progress_percentage}%</li>
                    {project.assignments && (
                      <li>Miembros del equipo: {project.assignments.length}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <Link to={`/projects/${project.id}`} className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Task Management */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <TaskList
            projectId={project.id}
            canManageTasks={user?.role === 'admin' || user?.role === 'collaborator'}
          />
        </Card>

        {/* Project Assignments */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Asignaciones del Proyecto
          </h2>
          <ProjectAssignments
            projectId={project.id}
            assignments={project.assignments || []}
            onAssignmentChange={fetchProject}
            canManageAssignments={canAssignUsersToProject()}
          />
        </Card>
      </div>
    </div>
  );
};

export default EditProject;
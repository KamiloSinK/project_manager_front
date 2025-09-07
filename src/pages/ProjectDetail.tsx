import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import type { Project, ProjectDetailStats } from '../types';
import { Button } from '../components/ui';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import ProjectAssignments from '../components/ProjectAssignments';
import TaskList from '../components/TaskList';
import ProjectStatusButtons from '../components/ProjectStatusButtons';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useAuth();
  const { canAssignUsersToProject } = usePermissions();
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectDetailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  on_hold: 'bg-orange-100 text-orange-800 border-orange-200'
};

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
  active: 'Activo',
  on_hold: 'En Pausa'
};

  const fetchProject = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const [projectData, statsData] = await Promise.all([
        projectService.getProject(parseInt(id)),
        projectService.getProjectStats(parseInt(id))
      ]);
      setProject(projectData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar el proyecto');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleDelete = async () => {
    if (!project || !window.confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await projectService.deleteProject(project.id);
      navigate('/projects', { replace: true });
    } catch (err) {
      setError('Error al eliminar el proyecto');
      console.error('Error deleting project:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const canEdit = user?.role === 'admin' || project?.created_by === user?.id;
  const canDelete = user?.role === 'admin' || project?.created_by === user?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Proyecto no encontrado'}
              </h3>
              <p className="text-gray-600 mb-6">
                El proyecto que buscas no existe o no tienes permisos para verlo.
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/projects">
              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[project.status]}`}>
                  {statusLabels[project.status]}
                </span>
                {project.is_overdue && (
                  <div className="flex items-center text-red-500 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Proyecto retrasado
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Link to={`/projects/${project.id}/edit`}>
                  <Button variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </Button>
                </Link>
              )}
              {canDelete && (
                <Button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  {deleteLoading ? (
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks Section */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TaskList
                projectId={project.id}
                canManageTasks={user?.role === 'admin' || user?.role === 'collaborator'}
              />
            </Card>

            {/* Project Info */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información del Proyecto
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
                  <p className="text-gray-900 leading-relaxed">
                    {project.description || 'Sin descripción disponible'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</h3>
                    <p className="text-gray-900 font-medium">
                      {formatDate(project.start_date)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Fecha de Fin</h3>
                    <p className="text-gray-900 font-medium">
                      {formatDate(project.end_date)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Creado por</h3>
                  <p className="text-gray-900 font-medium">
                    {project.created_by.first_name}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Fecha de Creación</h3>
                  <p className="text-gray-900 font-medium">
                    {formatDate(project.created_at)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Progress */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Progreso del Proyecto
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Progreso General</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {project.progress_percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(stats?.progress_percentage ?? project.progress_percentage)}`}
                    style={{ width: `${stats?.progress_percentage ?? project.progress_percentage}%` }}
                  ></div>
                </div>

                {(stats?.days_remaining !== undefined || project.days_remaining !== undefined) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Días restantes</span>
                    <span className={`font-medium ${
                      (stats?.days_remaining ?? project.days_remaining) < 0 
                        ? 'text-red-600' 
                        : (stats?.days_remaining ?? project.days_remaining) < 7 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      {(stats?.days_remaining ?? project.days_remaining) < 0 
                        ? `${Math.abs(stats?.days_remaining ?? project.days_remaining)} días de retraso`
                        : `${stats?.days_remaining ?? project.days_remaining} días`
                      }
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Estadísticas Rápidas
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estado</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progreso</span>
                  <span className="font-semibold text-gray-900">
                    {stats?.progress_percentage ?? project.progress_percentage}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Tareas</span>
                  <span className="font-semibold text-gray-900">
                    {stats?.total_tasks ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completadas</span>
                  <span className="font-semibold text-green-600">
                    {stats?.completed_tasks ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">En Progreso</span>
                  <span className="font-semibold text-blue-600">
                    {stats?.in_progress_tasks ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pendientes</span>
                  <span className="font-semibold text-yellow-600">
                    {stats?.pending_tasks ?? 0}
                  </span>
                </div>

                {stats?.overdue_tasks && stats.overdue_tasks > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Atrasadas</span>
                    <span className="font-semibold text-red-600">
                      {stats.overdue_tasks}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Miembros</span>
                  <span className="font-semibold text-gray-900">
                    {stats?.total_members ?? project.assignments?.length ?? 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Project Status Controls */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <ProjectStatusButtons
                project={project}
                onStatusChange={fetchProject}
              />
            </Card>

            {/* Project Assignments */}
            <ProjectAssignments
              projectId={project.id}
              assignments={project.assignments || []}
              onAssignmentChange={fetchProject}
              canManageAssignments={canAssignUsersToProject()}
            />


          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
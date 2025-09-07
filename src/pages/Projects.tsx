import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import type { ProjectListItem } from '../types';
import { Button } from '../components/ui';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';

const Projects: React.FC = () => {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;




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

  const fetchProjects = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjects({ page });
      
      // Si la respuesta es paginada
      if (response && typeof response === 'object' && 'results' in response) {
        setProjects(response.results);
        setTotalItems(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
      } else {
        // Si no es paginada, usar los datos directamente
        setProjects(Array.isArray(response) ? response : []);
        setTotalItems(Array.isArray(response) ? response.length : 0);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Proyectos
              </h1>
              <p className="text-gray-600">
                Administra y supervisa todos tus proyectos
              </p>
            </div>
            <Link to="/projects/new">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Proyecto
              </Button>
            </Link>
          </div>
        </div>



        {/* Error State */}
        {error && (
          <Card className="mb-8 p-6 bg-red-50 border-red-200">
            <div className="flex items-center text-red-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </Card>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay proyectos
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza creando tu primer proyecto
              </p>
              <Link to="/projects/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  Crear Proyecto
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:-translate-y-1">
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </div>
                    {project.is_overdue && (
                      <div className="flex items-center text-red-500 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Retrasado
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description || 'Sin descripción'}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium text-gray-900">
                        {project.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress_percentage)}`}
                        style={{ width: `${project.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">Inicio</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(project.start_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Fin</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(project.end_date)}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm block mb-2">Estadísticas</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                        <span className="text-gray-600">Total</span>
                        <span className="font-medium">{project.total_tasks}</span>
                      </div>
                      <div className="flex items-center justify-between bg-green-50 rounded px-2 py-1">
                        <span className="text-green-600">Completadas</span>
                        <span className="font-medium text-green-700">{project.completed_tasks}</span>
                      </div>
                      <div className="flex items-center justify-between bg-blue-50 rounded px-2 py-1">
                        <span className="text-blue-600">En progreso</span>
                        <span className="font-medium text-blue-700">{project.in_progress_tasks}</span>
                      </div>
                      <div className="flex items-center justify-between bg-yellow-50 rounded px-2 py-1">
                        <span className="text-yellow-600">Pendientes</span>
                        <span className="font-medium text-yellow-700">{project.pending_tasks}</span>
                      </div>
                      {project.overdue_tasks > 0 && (
                        <div className="flex items-center justify-between bg-red-50 rounded px-2 py-1">
                          <span className="text-red-600">Retrasadas</span>
                          <span className="font-medium text-red-700">{project.overdue_tasks}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between bg-purple-50 rounded px-2 py-1">
                        <span className="text-purple-600">Miembros</span>
                        <span className="font-medium text-purple-700">{project.total_members}</span>
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  {project.assignments && project.assignments.length > 0 && (
                    <div className="mb-4">
                      <span className="text-gray-500 text-sm block mb-2">Equipo</span>
                      <div className="flex -space-x-2">
                        {project.assignments.slice(0, 3).map((assignment, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                            title={assignment.user.first_name}
                          >
                            {assignment.user.first_name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.assignments.length > 3 && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                            +{project.assignments.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        Ver Detalles
                      </Button>
                    </Link>
                    {(user?.role === 'admin' || project.created_by === String(user?.id)) && (
                      <Link to={`/projects/${project.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Paginación */}
        {!loading && !error && projects.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
    </div>
  );
};

export default Projects;
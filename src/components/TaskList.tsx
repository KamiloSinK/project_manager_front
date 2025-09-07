import React, { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStats } from '../types';
import { taskService } from '../services/taskService';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { Button } from './ui';
import Pagination from './Pagination';

interface TaskListProps {
  projectId: number;
  canManageTasks: boolean;
  showDashboardStats?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ projectId, canManageTasks, showDashboardStats = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadTasks = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      
      const tasksResponse = await taskService.getProjectTasks(projectId, { page });
      
      // Si la respuesta es paginada
      if (tasksResponse && typeof tasksResponse === 'object' && 'results' in tasksResponse) {
        setTasks((tasksResponse as any).results);
        setTotalItems((tasksResponse as any).count || 0);
        setTotalPages(Math.ceil(((tasksResponse as any).count || 0) / itemsPerPage));
      } else {
        // Si no es paginada, usar los datos directamente
        setTasks(Array.isArray(tasksResponse) ? tasksResponse : []);
        setTotalItems(Array.isArray(tasksResponse) ? tasksResponse.length : 0);
        setTotalPages(1);
      }
      
      if (showDashboardStats) {
        const statsResponse = await taskService.getDashboardStats();
        setTaskStats(statsResponse);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, showDashboardStats]);

  useEffect(() => {
    loadTasks(currentPage);
  }, [projectId, currentPage, loadTasks]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTaskSaved = () => {
    loadTasks(currentPage);
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };



  const getTaskStats = () => {
    if (taskStats) {
      return {
        total: taskStats.total_tasks,
        pending: taskStats.pending_tasks,
        inProgress: taskStats.in_progress_tasks,
        completed: taskStats.completed_tasks,
        overdue: taskStats.overdue_tasks
      };
    }
    
    // Fallback a cálculo local si no hay estadísticas del servidor
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.is_overdue && t.status !== 'completed').length;

    return { total, pending, inProgress, completed, overdue };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tareas del Proyecto</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              Total: {stats.total}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              Pendientes: {stats.pending}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              En progreso: {stats.inProgress}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              Completadas: {stats.completed}
            </span>
            {stats.overdue > 0 && (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                Vencidas: {stats.overdue}
              </span>
            )}
          </div>
        </div>
        {canManageTasks && (
          <Button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Tarea
          </Button>
        )}
      </div>



      {/* Lista de tareas */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay tareas
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {canManageTasks 
              ? 'Comienza creando la primera tarea del proyecto.'
              : 'Aún no se han creado tareas para este proyecto.'
            }
          </p>
          {canManageTasks && (
            <div className="mt-6">
              <Button
                onClick={() => setShowTaskForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear primera tarea
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskUpdate={loadTasks}
              onTaskDelete={loadTasks}
              onEditTask={handleEditTask}
              canManageTasks={canManageTasks}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {!loading && tasks.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Modal de formulario */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseForm}
        onTaskSaved={handleTaskSaved}
        projectId={projectId}
        task={editingTask}
      />
    </div>
  );
};

export default TaskList;
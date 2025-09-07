import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

// Definición de permisos por rol
const ROLE_PERMISSIONS = {
  admin: [
    'create_project',
    'edit_project',
    'delete_project',
    'view_project',
    'assign_users_to_project',
    'create_task',
    'edit_task',
    'delete_task',
    'view_task',
    'assign_task',
    'comment_task',
    'manage_users',
    'view_all_projects',
    'view_all_tasks'
  ],
  collaborator: [
    'create_project',
    'edit_project',
    'view_project',
    'create_task',
    'edit_task',
    'view_task',
    'assign_task',
    'comment_task',
    'view_assigned_projects',
    'view_assigned_tasks'
  ],
  viewer: [
    'view_project',
    'view_task',
    'comment_task',
    'view_assigned_projects',
    'view_assigned_tasks'
  ]
} as const;

type Permission = 
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'view_project'
  | 'assign_users_to_project'
  | 'create_task'
  | 'edit_task'
  | 'delete_task'
  | 'view_task'
  | 'assign_task'
  | 'comment_task'
  | 'manage_users'
  | 'view_all_projects'
  | 'view_all_tasks'
  | 'view_assigned_projects'
  | 'view_assigned_tasks';

export function usePermissions() {
  const { state: { user } } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.role) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
    return (rolePermissions as readonly Permission[]).includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canCreateProject = (): boolean => {
    return hasPermission('create_project');
  };

  const canEditProject = (project?: { created_by?: User }): boolean => {
    if (!user) return false;
    
    // Admin puede editar cualquier proyecto
    if (user.role === 'admin') return true;
    
    // Colaborador puede editar proyectos que creó
    if (user.role === 'collaborator' && project?.created_by?.id === user.id) {
      return true;
    }
    
    return hasPermission('edit_project');
  };

  const canDeleteProject = (): boolean => {
    if (!user) return false;
    
    // Solo admin puede eliminar proyectos
    if (user.role === 'admin') return true;
    
    return false;
  };

  const canAssignUsersToProject = (): boolean => {
    return hasPermission('assign_users_to_project');
  };

  const canCreateTask = (): boolean => {
    return hasPermission('create_task');
  };

  const canEditTask = (task?: { created_by?: User; assigned_to?: User }): boolean => {
    if (!user) return false;
    
    // Admin puede editar cualquier tarea
    if (user.role === 'admin') return true;
    
    // Colaborador puede editar tareas que creó o que le fueron asignadas
    if (user.role === 'collaborator') {
      if (task?.created_by?.id === user.id || task?.assigned_to?.id === user.id) {
        return true;
      }
    }
    
    return hasPermission('edit_task');
  };

  const canDeleteTask = (task?: { created_by?: User }): boolean => {
    if (!user) return false;
    
    // Admin puede eliminar cualquier tarea
    if (user.role === 'admin') return true;
    
    // Colaborador puede eliminar tareas que creó
    if (user.role === 'collaborator' && task?.created_by?.id === user.id) {
      return true;
    }
    
    return false;
  };

  const canAssignTask = (): boolean => {
    return hasPermission('assign_task');
  };

  const canCommentTask = (): boolean => {
    return hasPermission('comment_task');
  };

  const canDeleteComment = (comment?: { author?: { id?: number } }): boolean => {
    if (!user) return false;
    
    // Admin puede eliminar cualquier comentario
    if (user.role === 'admin') return true;
    
    // Solo el autor del comentario puede eliminarlo
    if (comment?.author?.id === user.id) return true;
    
    return false;
  };

  const canManageUsers = (): boolean => {
    return hasPermission('manage_users');
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const isCollaborator = (): boolean => {
    return user?.role === 'collaborator';
  };

  const isViewer = (): boolean => {
    return user?.role === 'viewer';
  };

  const getRoleLabel = (role: string): string => {
    const labels = {
      admin: 'Administrador',
      collaborator: 'Colaborador',
      viewer: 'Visor'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string): string => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      collaborator: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreateProject,
    canEditProject,
    canDeleteProject,
    canAssignUsersToProject,
    canCreateTask,
    canEditTask,
    canDeleteTask,
    canAssignTask,
    canCommentTask,
    canDeleteComment,
    canManageUsers,
    isAdmin,
    isCollaborator,
    isViewer,
    getRoleLabel,
    getRoleColor
  };
}

export type { Permission };
export { ROLE_PERMISSIONS };
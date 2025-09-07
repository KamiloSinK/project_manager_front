import React, { useState, useEffect } from 'react';
import type { User } from '../../types/auth';
import { authService } from '../../services/authService';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'react-hot-toast';

interface UserManagementProps {
  className?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ className = '' }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const { isAdmin } = usePermissions();

  useEffect(() => {
    if (!isAdmin) {
      toast.error('No tienes permisos para acceder a esta sección');
      return;
    }
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await authService.getAllUsersForAdmin();
      setUsers(usersData);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setUpdating(userId);
      const result = await authService.updateUserAsAdmin(userId, { role: newRole as 'admin' | 'collaborator' | 'viewer' });
      
      // Actualizar el usuario en la lista local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as 'admin' | 'collaborator' | 'viewer' } : user
      ));
      
      toast.success(result.message || 'Rol actualizado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar rol');
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    try {
      setUpdating(userId);
      const result = await authService.updateUserAsAdmin(userId, { is_active: isActive });
      
      // Actualizar el usuario en la lista local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
      
      toast.success(result.message || 'Estado actualizado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar estado');
    } finally {
      setUpdating(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'collaborator':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'collaborator':
        return 'Colaborador';
      case 'viewer':
        return 'Visor';
      default:
        return role;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Administración de Usuarios
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Gestiona los roles y estados de los usuarios del sistema.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.email
                        }
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className="text-sm rounded-full px-3 py-1 font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="admin">Administrador</option>
                    <option value="collaborator">Colaborador</option>
                    <option value="viewer">Visor</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={user.is_active}
                      onChange={(e) => handleStatusChange(user.id, e.target.checked)}
                      disabled={updating === user.id}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {updating === user.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Actualizando...
                    </div>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay usuarios para mostrar.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
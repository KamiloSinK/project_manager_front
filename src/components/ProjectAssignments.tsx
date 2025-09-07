import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { authService } from '../services/authService';
import type { User, ProjectAssignment } from '../types';
import { Button } from './ui';
import { Card } from './ui';

interface ProjectAssignmentsProps {
  projectId: number;
  assignments: ProjectAssignment[];
  onAssignmentChange: () => void;
  canManageAssignments: boolean;
}

const ProjectAssignments: React.FC<ProjectAssignmentsProps> = ({
  projectId,
  assignments,
  onAssignmentChange,
  canManageAssignments
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener lista de usuarios disponibles
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const usersData = await authService.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showAddForm && canManageAssignments) {
      fetchUsers();
    }
  }, [showAddForm, canManageAssignments]);

  // Filtrar usuarios que ya están asignados
  const availableUsers = users.filter(
    user => !assignments.some(assignment => assignment.user.id === user.id)
  );

  const handleAssignUser = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      setError(null);
      await projectService.assignUserToProject(projectId, {
        user_id: parseInt(selectedUserId)
      });
      setSelectedUserId('');
      setShowAddForm(false);
      onAssignmentChange();
    } catch (err) {
      setError('Error al asignar usuario');
      console.error('Error assigning user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await projectService.removeAssignment(projectId, assignmentId);
      onAssignmentChange();
    } catch (err) {
      setError('Error al eliminar asignación');
      console.error('Error removing assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Equipo del Proyecto
        </h2>
        {canManageAssignments && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {showAddForm ? 'Cancelar' : 'Asignar Usuario'}
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Formulario para asignar nuevo usuario */}
      {showAddForm && canManageAssignments && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-md font-medium text-gray-900 mb-3">
            Asignar Nuevo Usuario
          </h3>
          
          {loadingUsers ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="flex gap-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Seleccionar usuario...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAssignUser}
                disabled={!selectedUserId || loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Asignando...' : 'Asignar'}
              </Button>
            </div>
          )}
          
          {availableUsers.length === 0 && !loadingUsers && (
            <p className="text-sm text-gray-600 mt-2">
              No hay usuarios disponibles para asignar.
            </p>
          )}
        </div>
      )}

      {/* Lista de asignaciones actuales */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            No hay usuarios asignados a este proyecto.
          </p>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                {assignment.user.first_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {assignment.user.first_name} {assignment.user.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  {assignment.user.email}
                </p>
                <p className="text-xs text-gray-500">
                  Asignado el {new Date(assignment.assigned_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              {canManageAssignments && (
                <Button
                  onClick={() => handleRemoveAssignment(assignment.id)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  Eliminar
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ProjectAssignments;
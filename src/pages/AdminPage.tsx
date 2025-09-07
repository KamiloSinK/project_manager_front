import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import UserManagement from '../components/admin/UserManagement';
import { Navigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const { isAdmin } = usePermissions();

  // Redirigir si no es administrador
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Panel de Administración
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona usuarios, roles y configuraciones del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Gestión de Usuarios */}
          <UserManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
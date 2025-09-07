import React from 'react';

const Notifications: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🔔</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notificaciones
                </h1>
                <p className="text-sm text-gray-600">
                  Gestiona tus notificaciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sistema de Notificaciones
          </h2>
          <p className="text-gray-600">
            El sistema de notificaciones está funcionando correctamente.
            Esta página se está cargando sin errores.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
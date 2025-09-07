import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import type { CreateProjectData } from '../types';
import { Button } from '../components/ui';
import { Input } from '../components/ui';
import { Card } from '../components/ui';
interface FormErrors {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<CreateProjectData>({
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proyecto es obligatorio';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar descripción
    if (!formData.description.trim()) {
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
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const project = await projectService.createProject(formData);
      navigate(`/projects/${project.id}`, { replace: true });
    } catch (err: unknown) {
      console.error('Error creating project:', err);
      
      // Manejar errores del servidor
      if ((err as { response?: { data?: Record<string, unknown> } }).response?.data) {
        const serverErrors: FormErrors = {};
        const errorData = (err as { response: { data: Record<string, unknown> } }).response.data;
        Object.keys(errorData).forEach(key => {
          if (key in formData) {
            serverErrors[key as keyof FormErrors] = Array.isArray(errorData[key]) 
              ? (errorData[key] as string[])[0] 
              : errorData[key] as string;
          }
        });
        setErrors(serverErrors);
      } else {
        setErrors({ name: 'Error al crear el proyecto. Inténtalo de nuevo.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Crear Nuevo Proyecto
              </h1>
              <p className="text-gray-600 mt-1">
                Completa la información para crear un nuevo proyecto
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
                  min={today}
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
                  min={formData.start_date || today}
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
                Estado Inicial *
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

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Una vez creado, podrás asignar miembros al proyecto</li>
                    <li>El progreso se calculará automáticamente basado en las tareas</li>
                    <li>Podrás editar toda la información después de crear el proyecto</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <Link to="/projects" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Proyecto
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateProject;
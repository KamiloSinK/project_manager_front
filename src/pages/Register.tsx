import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, CardContent } from '../components/ui';
import type { RegisterData } from '../types/auth';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterData>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Las contraseñas no coinciden';
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Register error:', error);
      if ((error as { response?: { data?: { details?: Record<string, string> } } }).response?.data?.details) {
        // Handle field-specific errors from backend
        setErrors((error as { response: { data: { details: Record<string, string> } } }).response.data.details);
      } else {
        setErrors({ username: 'Error al crear la cuenta. Intenta de nuevo.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Project Manager
          </h1>
          <p className="text-gray-600 text-lg">
            Únete a nuestra plataforma
          </p>
        </div>
        
        {/* Register Form */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info Section */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={errors.first_name}
                    placeholder="Tu nombre"
                    autoComplete="given-name"
                  />
                  
                  <Input
                    label="Apellido"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={errors.last_name}
                    placeholder="Tu apellido"
                    autoComplete="family-name"
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
                
                <Input
                  label="Nombre de usuario"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="nombre_usuario"
                  autoComplete="username"
                />
              </div>
              
              {/* Password Section */}
              <div className="space-y-5 pt-2">
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Configurar contraseña</h3>
                </div>
                
                <Input
                  label="Contraseña"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  helperText="Mínimo 6 caracteres"
                />
                
                <Input
                  label="Confirmar Contraseña"
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  error={errors.password_confirm}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-8"
                isLoading={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
            
            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Al registrarte, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
};

export default Register;
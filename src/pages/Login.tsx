import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, CardContent } from '../components/ui';
import type { LoginCredentials } from '../types/auth';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};
    
    if (!credentials.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    }
    
    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      if ((error as { response?: { status?: number } }).response?.status === 401) {
        setErrors({ email: 'Credenciales inválidas' });
      } else {
        setErrors({ email: 'Error de conexión. Intenta de nuevo.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Project Manager
          </h1>
          <p className="text-gray-600 text-lg">
            Bienvenido de vuelta
          </p>
        </div>
        
        {/* Login Form */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <Input
                  label="Correo electrónico"
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
                
                <Input
                  label="Contraseña"
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-8"
                isLoading={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Gestiona tus proyectos de manera eficiente
        </p>
      </div>
    </div>
  );
};

export default Login;
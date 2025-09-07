import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { Login, Register, Dashboard } from './pages'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import EditProject from './pages/EditProject'
import Notifications from './pages/Notifications'
import AdminPage from './pages/AdminPage'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de proyectos */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/new" 
              element={
                <ProtectedRoute>
                  <CreateProject />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id" 
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditProject />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de notificaciones */}
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de administración (solo para administradores) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Ruta 404 - redirige al dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

# Project Manager Frontend

Aplicación frontend para el sistema de gestión de proyectos y tareas desarrollada con React, TypeScript y Vite.

## 🚀 Características

- **React 18** con TypeScript para un desarrollo tipado y robusto
- **Vite** como bundler para desarrollo rápido y builds optimizados
- **Tailwind CSS** para estilos utilitarios y diseño responsivo
- **React Router** para navegación SPA
- **Context API** para manejo de estado global
- **Lucide React** para iconografía moderna
- **Autenticación JWT** con refresh tokens
- **Notificaciones en tiempo real**
- **Gestión de permisos** basada en roles

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16.0 o superior)
- **npm** (viene incluido con Node.js)
- **Git** para clonar el repositorio

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd project_manager_front
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configuración del entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL del backend API
VITE_API_URL=http://localhost:8000/api

# URL base para desarrollo
VITE_BASE_URL=http://localhost:3000
```

## 🚀 Ejecución en Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Esto iniciará la aplicación en modo desarrollo en `http://localhost:3000`.

### Características del modo desarrollo:
- **Hot Module Replacement (HMR)** para recarga instantánea
- **Source maps** para debugging
- **Error overlay** para mostrar errores en pantalla
- **Fast Refresh** para mantener el estado durante cambios

## 🏗️ Build para Producción

### 1. Generar build de producción

```bash
npm run build
```

Esto creará una carpeta `dist/` con los archivos optimizados para producción.

### 2. Preview del build

Para probar el build localmente:

```bash
npm run preview
```

### 3. Características del build de producción:
- **Minificación** de JavaScript y CSS
- **Tree shaking** para eliminar código no utilizado
- **Code splitting** para carga optimizada
- **Asset optimization** para imágenes y recursos
- **Gzip compression** ready

## 🧪 Testing y Calidad de Código

### Linting

```bash
npm run lint
```

### Formateo de código

```bash
npm run format
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base de UI
│   ├── forms/          # Componentes de formularios
│   └── layout/         # Componentes de layout
├── contexts/           # Context providers (Auth, Notifications)
├── hooks/              # Custom hooks
├── pages/              # Páginas/rutas principales
├── services/           # Servicios API y utilidades
├── types/              # Definiciones de TypeScript
├── utils/              # Funciones utilitarias
└── assets/             # Recursos estáticos
```

## 🔧 Configuración Adicional

### Variables de Entorno Disponibles

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL del backend API | `http://localhost:8000/api` |
| `VITE_BASE_URL` | URL base de la aplicación | `http://localhost:3000` |

### Configuración de Tailwind CSS

El proyecto utiliza Tailwind CSS con configuración personalizada en `tailwind.config.js`.

### Configuración de TypeScript

- `tsconfig.json` - Configuración principal
- `tsconfig.app.json` - Configuración para la aplicación
- `tsconfig.node.json` - Configuración para Vite

## 🌐 Despliegue

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Build command: `npm run build`
4. Publish directory: `dist`

### Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. El framework será detectado automáticamente

### Servidor tradicional

1. Ejecuta `npm run build`
2. Sube el contenido de la carpeta `dist/` a tu servidor
3. Configura el servidor para servir `index.html` en todas las rutas

## 🔗 Integración con Backend

Esta aplicación está diseñada para trabajar con el backend Django del proyecto. Asegúrate de:

1. **Backend ejecutándose** en `http://localhost:8000`
2. **CORS configurado** para permitir requests desde `http://localhost:3000`
3. **Base de datos** configurada y migrada
4. **Variables de entorno** del backend configuradas

## 📚 Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utilitario
- **React Router DOM** - Enrutamiento
- **Lucide React** - Iconos
- **ESLint** - Linting de código

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Solución de Problemas

### Error: "Cannot connect to backend"
- Verifica que el backend esté ejecutándose en `http://localhost:8000`
- Revisa las variables de entorno en `.env`
- Verifica la configuración de CORS en el backend

### Error: "Module not found"
- Ejecuta `npm install` para instalar dependencias
- Verifica que todas las importaciones sean correctas
- Limpia la caché con `npm run dev -- --force`

### Problemas de rendimiento
- Verifica que estés usando el modo desarrollo (`npm run dev`)
- Revisa la consola del navegador para errores
- Considera usar React DevTools para debugging

## 📞 Soporte

Si encuentras algún problema o tienes preguntas, por favor:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**Desarrollado con ❤️ usando React y TypeScript**

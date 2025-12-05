# Herramienta de Ayuda Financiera Personal

Una aplicación web minimalista y acogedora para organizar tus finanzas personales de manera simple y sin estrés.

## ✨ Características

- **Saludo personalizado** - La aplicación te recibe con un saludo cálido según la hora del día
- **Gestión de ingresos fijos** - Registra todas tus fuentes de ingreso mensuales
- **Control de gastos fijos** - Mantén un seguimiento de tus gastos regulares
- **Administración de deudas** - Organiza tus deudas con montos y tasas de interés
- **Seguimiento de préstamos** - Gestiona los préstamos que has otorgado
- **Metas de ahorro personalizadas** - Crea múltiples metas con títulos y montos objetivo
- **Soporte multi-moneda** - Peso Chileno (CLP), Dólares (USD) y Euros (EUR)
- **Conversión automática** - Los montos se convierten automáticamente al cambiar de moneda
- **Sistema de autenticación** - Login y registro conectados con Laravel
- **Resumen financiero** - Visualiza tu situación financiera de un vistazo

## 🚀 Guía Rápida de Inicio

### IMPORTANTE: Lee primero GUIA_DESARROLLO.md

El archivo **[GUIA_DESARROLLO.md](./GUIA_DESARROLLO.md)** contiene todos los comandos en orden para:
1. Configurar MySQL
2. Crear y configurar Laravel
3. Configurar Next.js
4. Verificar la conexión
5. Probar autenticación

### Resumen de Comandos

**Terminal 1 - MySQL:**
\`\`\`bash
# Iniciar MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE financial_aid;
\`\`\`

**Terminal 2 - Laravel:**
\`\`\`bash
cd financial-aid-backend
php artisan serve
\`\`\`

**Terminal 3 - Next.js:**
\`\`\`bash
cd financial-aid-frontend
npm install
npm run dev
\`\`\`

**Verificar conexión:**
\`\`\`
http://localhost:3000/db-check
\`\`\`

**Acceder a login:**
\`\`\`
http://localhost:3000/login
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
├── app/
│   ├── db-check/          # Verificación de conexión a BD
│   ├── login/             # Formularios de autenticación
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio
│   └── globals.css        # Estilos globales y tema
├── components/
│   ├── auth-forms.tsx     # Formularios de login/registro
│   ├── finance-app.tsx    # Componente principal
│   ├── welcome-header.tsx # Cabecera con saludo
│   ├── financial-summary.tsx # Resumen financiero
│   └── savings-goals.tsx  # Metas de ahorro
├── lib/
│   ├── api-client.ts      # Cliente API para Laravel
│   ├── currency-converter.ts # Conversión de monedas
│   └── database-config.ts # Configuración de BD
├── GUIA_DESARROLLO.md     # ⭐ GUÍA PRINCIPAL - Lee esto primero
├── LARAVEL_SETUP.md       # Detalles de Laravel
└── README.md              # Este archivo
\`\`\`

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

### Cambiar Base de Datos

Edita `lib/database-config.ts`:

\`\`\`typescript
const ACTIVE_DATABASE: DatabaseType = "LARAVEL" // Opciones: "LARAVEL", "LOCAL", "SUPABASE"
\`\`\`

## 🌐 Rutas Disponibles

- `/` - Aplicación principal de finanzas
- `/login` - Formularios de autenticación (registro/login)
- `/db-check` - Verificación de conexión a base de datos

## 🛠️ Tecnologías

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Backend**: Laravel 11 + MySQL 8.0+
- **Estilos**: Tailwind CSS v4
- **UI**: shadcn/ui
- **Autenticación**: Laravel Sanctum

## 📚 Documentación Adicional

- **[GUIA_DESARROLLO.md](./GUIA_DESARROLLO.md)** - Guía completa paso a paso con todos los comandos
- **[LARAVEL_SETUP.md](./LARAVEL_SETUP.md)** - Estructura de base de datos y modelos Laravel

## 🎨 Personalización

### Cambiar Colores

Edita `app/globals.css`:

\`\`\`css
:root {
  --primary: oklch(0.52 0.085 162.1);
  --secondary: oklch(0.42 0.095 232.1);
  /* ... más variables */
}
\`\`\`

### Agregar Nuevas Monedas

Edita `lib/currency-converter.ts`:

\`\`\`typescript
export const CURRENCIES = {
  CLP: { symbol: "$", name: "Peso Chileno", rate: 1 },
  USD: { symbol: "$", name: "Dólar", rate: 0.0011 },
  EUR: { symbol: "€", name: "Euro", rate: 0.001 },
  // Agregar nueva moneda aquí
}
\`\`\`

## 🔐 Sistema de Autenticación

### Acceder a Formularios

1. Click en botón "Salir" (esquina superior derecha)
2. O visita directamente `/login`

### Crear Usuario

1. Ir a `/login`
2. Llenar formulario de registro
3. El usuario se crea en MySQL
4. Se genera un token de autenticación
5. Redirección automática a la app

## 🐛 Solución de Problemas

### Error 404 en /db-check

- Verificar que Laravel esté corriendo: `http://localhost:8000`
- Verificar variable `NEXT_PUBLIC_API_URL` en `.env.local`
- Verificar CORS en Laravel (`config/cors.php`)

### No se puede conectar a MySQL

\`\`\`bash
# Verificar estado de MySQL
mysql -u root -p

# Verificar credenciales en Laravel (.env)
DB_DATABASE=financial_aid
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
\`\`\`

### Error en migraciones de Laravel

\`\`\`bash
php artisan migrate:fresh
php artisan config:clear
php artisan cache:clear
\`\`\`

## 📝 Notas Importantes

- MySQL debe estar corriendo antes de iniciar Laravel
- Laravel debe estar corriendo antes de usar Next.js
- Los 3 servicios deben estar activos simultáneamente
- Los datos se guardan en MySQL (no localStorage)
- La conversión de monedas es automática al cambiar

## 🚀 Próximos Pasos

1. ✅ Backend Laravel configurado
2. ✅ Autenticación con Sanctum
3. ✅ Conversión de monedas automática
4. ✅ Metas de ahorro múltiples
5. ⏳ Controladores para ingresos, gastos, deudas
6. ⏳ Dashboard con gráficos
7. ⏳ Exportar reportes PDF

---

Desarrollado con Laravel + Next.js para hacer las finanzas más accesibles
\`\`\`

```md file="" isHidden

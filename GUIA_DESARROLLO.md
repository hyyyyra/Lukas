# Guía de Desarrollo - Herramienta de Ayuda Financiera

Esta guía contiene todos los comandos necesarios **en orden** para levantar tu ambiente de desarrollo completo (Next.js + MySQL).

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v18 o superior) - [Descargar](https://nodejs.org/)
- **MySQL** (ejecutándose en localhost) - [Descargar](https://dev.mysql.com/downloads/)

---

## PASO 1: Configurar MySQL

### 1.1 Iniciar MySQL
\`\`\`bash
# En Windows (si MySQL está instalado como servicio)
net start MySQL

# En macOS (si usas Homebrew)
brew services start mysql

# En Linux
sudo systemctl start mysql
\`\`\`

### 1.2 Ejecutar scripts SQL

\`\`\`bash
# Conectarse a MySQL
mysql -u root -p

# Dentro de MySQL, ejecutar los scripts en orden:

# Script 1: Crear base de datos y tabla usuarios
source /ruta/completa/a/tu/proyecto/scripts/01_crear_base_datos.sql

# Script 2: Crear tablas financieras
source /ruta/completa/a/tu/proyecto/scripts/02_crear_tablas_financieras.sql

# Script 3 (OPCIONAL): Insertar datos de prueba
source /ruta/completa/a/tu/proyecto/scripts/03_datos_prueba.sql

# Verificar que todo se creó correctamente
SHOW TABLES;

# Salir de MySQL
exit;
\`\`\`

**Alternativa (ejecutar desde línea de comandos):**
\`\`\`bash
# Ejecutar todos los scripts desde fuera de MySQL
mysql -u root -p < scripts/01_crear_base_datos.sql
mysql -u root -p < scripts/02_crear_tablas_financieras.sql
mysql -u root -p < scripts/03_datos_prueba.sql
\`\`\`

---

## PASO 2: Configurar Frontend Next.js

### 2.1 Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 2.2 Crear archivo .env.local
\`\`\`bash
# En Windows
copy .env.example .env.local

# En macOS/Linux
cp .env.example .env.local
\`\`\`

### 2.3 Editar .env.local

Abre `.env.local` y configura tus credenciales de MySQL:

\`\`\`env
# Configuración de MySQL (ajusta según tus credenciales)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_DATABASE=finanzas_app
\`\`\`

### 2.4 Iniciar servidor Next.js
\`\`\`bash
npm run dev
\`\`\`

**Next.js ahora debe estar corriendo en `http://localhost:3000`**

---

## PASO 3: Verificar Conexión

### 3.1 Abrir navegador
\`\`\`
http://localhost:3000/db-check
\`\`\`

### 3.2 Hacer clic en "Verificar Conexión"

Debes ver un mensaje verde de **"Conexión exitosa a la base de datos"**.

---

## PASO 4: Probar Autenticación

### 4.1 Ir a página de login
\`\`\`
http://localhost:3000/login
\`\`\`

### 4.2 Opción A: Usar datos de prueba (si ejecutaste el script 3)

- **Email:** juan@ejemplo.com
- **Contraseña:** test123

### 4.2 Opción B: Registrar un nuevo usuario

Completa el formulario de registro con:
- Nombre
- Apellidos
- Email
- Contraseña

### 4.3 Verificar en MySQL
\`\`\`bash
mysql -u root -p
USE finanzas_app;
SELECT * FROM usuarios;
exit;
\`\`\`

---

## Comandos Diarios (después de la configuración inicial)

### Para trabajar cada día:

**Terminal 1 - Verificar MySQL:**
\`\`\`bash
# Windows
net start MySQL

# macOS
brew services list | grep mysql

# Linux
sudo systemctl status mysql
\`\`\`

**Terminal 2 - Next.js:**
\`\`\`bash
cd ruta/a/tu/proyecto
npm run dev
\`\`\`

---

## Solución de Problemas Comunes

### Error de conexión a MySQL
\`\`\`bash
# Reiniciar MySQL
# Windows: net stop MySQL && net start MySQL
# macOS: brew services restart mysql
# Linux: sudo systemctl restart mysql

# Verificar credenciales
mysql -u root -p finanzas_app
\`\`\`

### Error "Table doesn't exist"
\`\`\`bash
# Ejecutar nuevamente los scripts SQL
mysql -u root -p < scripts/01_crear_base_datos.sql
mysql -u root -p < scripts/02_crear_tablas_financieras.sql
\`\`\`

### Error "Cannot find module 'mysql2'"
\`\`\`bash
npm install mysql2
\`\`\`

### Puerto 3000 ocupado
\`\`\`bash
# Usar otro puerto
npm run dev -- -p 3001
\`\`\`

---

## Estructura de Base de Datos

### Tabla: usuarios
- `id` - INT (Primary Key)
- `nombre` - VARCHAR(100)
- `apellidos` - VARCHAR(100)
- `email` - VARCHAR(255) (Unique)
- `password` - VARCHAR(255)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Tabla: ingresos
- `id` - INT (Primary Key)
- `user_id` - INT (Foreign Key → usuarios.id)
- `nombre` - VARCHAR(255)
- `monto` - DECIMAL(15, 2)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Tabla: gastos
- Similar a ingresos

### Tabla: deudas
- Similar a ingresos + `tasa_interes` DECIMAL(5, 2)

### Tabla: prestamos
- Similar a deudas

### Tabla: metas_ahorro
- `id` - INT (Primary Key)
- `user_id` - INT (Foreign Key → usuarios.id)
- `titulo` - VARCHAR(255)
- `meta_monto` - DECIMAL(15, 2)
- `monto_actual` - DECIMAL(15, 2)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

---

## Cambiar entre bases de datos

Para cambiar a otra base de datos (PostgreSQL, MongoDB, etc.):

1. Editar `lib/database-config.ts`
2. Cambiar la constante `ACTIVE_DATABASE` al valor deseado
3. Configurar las credenciales correspondientes en `.env.local`

---

## Notas Importantes

1. **Nunca commitear archivos .env.local** - Contienen información sensible
2. **MySQL debe estar corriendo** antes de iniciar Next.js
3. **Las contraseñas NO están hasheadas** - Solo para desarrollo (usar hash en producción)
4. **Los scripts SQL son idempotentes** - Puedes ejecutarlos múltiples veces sin problemas

---

## Próximos Pasos

Una vez que todo funcione:

1. Implementar las rutas API para ingresos, gastos, deudas y préstamos
2. Agregar autenticación a todas las rutas que manipulan datos
3. Implementar hash de contraseñas con bcrypt
4. Agregar validaciones de entrada
5. Implementar sincronización de moneda con la base de datos

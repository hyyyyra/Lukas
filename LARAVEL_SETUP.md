# Guía de Implementación con Laravel + MySQL

Esta guía te ayudará a configurar un backend Laravel con MySQL para tu aplicación de finanzas personales.

## ¿Por qué Laravel?

Laravel es un framework PHP robusto y elegante que ofrece:

- Autenticación completa con Laravel Sanctum
- ORM Eloquent para trabajar con la base de datos de forma intuitiva
- Migraciones para gestionar el esquema de la base de datos
- API RESTful fácil de construir
- Soporte para múltiples bases de datos (MySQL, PostgreSQL, SQLite, etc.)

---

## Requisitos Previos

- PHP 8.1 o superior
- Composer (gestor de paquetes de PHP)
- MySQL 8.0 o superior
- Node.js y npm (para el frontend)

---

## Parte 1: Configurar Laravel Backend

### Paso 1: Instalar Laravel

\`\`\`bash
# Crear nuevo proyecto Laravel
composer create-project laravel/laravel finanzas-api

# Entrar al directorio
cd finanzas-api
\`\`\`

### Paso 2: Configurar MySQL

Crea una base de datos en MySQL:

\`\`\`sql
CREATE DATABASE finanzas_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

Edita el archivo \`.env\` en tu proyecto Laravel:

\`\`\`env
APP_NAME="Finanzas API"
APP_URL=http://localhost:8000

# Configuración de base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finanzas_app
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña

# CORS para permitir peticiones desde Next.js
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
\`\`\`

### Paso 3: Instalar Laravel Sanctum

\`\`\`bash
# Instalar Sanctum para autenticación API
composer require laravel/sanctum

# Publicar configuración de Sanctum
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"

# Ejecutar migraciones
php artisan migrate
\`\`\`

Edita \`app/Http/Kernel.php\` y descomenta esta línea en el grupo 'api':

\`\`\`php
'api' => [
    \\Laravel\\Sanctum\\Http\\Middleware\\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \\Illuminate\\Routing\\Middleware\\SubstituteBindings::class,
],
\`\`\`

### Paso 4: Configurar CORS

Edita \`config/cors.php\`:

\`\`\`php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
\`\`\`

### Paso 5: Crear Migraciones

\`\`\`bash
# Crear migraciones para las tablas
php artisan make:migration create_ingresos_table
php artisan make:migration create_gastos_table
php artisan make:migration create_deudas_table
php artisan make:migration create_prestamos_table
php artisan make:migration create_metas_ahorro_table
php artisan make:migration add_currency_to_users_table
\`\`\`

**Migración: Ingresos** (\`database/migrations/xxxx_create_ingresos_table.php\`)

\`\`\`php
<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingresos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nombre');
            $table->decimal('monto', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingresos');
    }
};
\`\`\`

**Migración: Gastos** (\`database/migrations/xxxx_create_gastos_table.php\`)

\`\`\`php
<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nombre');
            $table->decimal('monto', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos');
    }
};
\`\`\`

**Migración: Deudas** (\`database/migrations/xxxx_create_deudas_table.php\`)

\`\`\`php
<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deudas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nombre');
            $table->decimal('monto', 12, 2);
            $table->decimal('tasa', 5, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deudas');
    }
};
\`\`\`

**Migración: Préstamos** (\`database/migrations/xxxx_create_prestamos_table.php\`)

\`\`\`php
<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prestamos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nombre');
            $table->decimal('monto', 12, 2);
            $table->decimal('tasa', 5, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamos');
    }
};
\`\`\`

**Migración: Metas de Ahorro** (\`database/migrations/xxxx_create_metas_ahorro_table.php\`)

\`\`\`php
<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metas_ahorro', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titulo');
            $table->decimal('meta_monto', 12, 2);
            $table->decimal('monto_actual', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metas_ahorro');
    }
};
\`\`\`

**Migración: Añadir moneda a usuarios** (\`database/migrations/xxxx_add_currency_to_users_table.php\`)

\`\`\`php
<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('currency')->default('CLP')->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
};
\`\`\`

Ejecutar todas las migraciones:

\`\`\`bash
php artisan migrate
\`\`\`

### Paso 6: Crear Modelos

\`\`\`bash
php artisan make:model Ingreso
php artisan make:model Gasto
php artisan make:model Deuda
php artisan make:model Prestamo
php artisan make:model MetaAhorro
\`\`\`

**Modelo: Ingreso** (\`app/Models/Ingreso.php\`)

\`\`\`php
<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Ingreso extends Model
{
    protected $table = 'ingresos';

    protected $fillable = ['user_id', 'nombre', 'monto'];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
\`\`\`

**Modelo: Gasto** (\`app/Models/Gasto.php\`)

\`\`\`php
<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Gasto extends Model
{
    protected $table = 'gastos';

    protected $fillable = ['user_id', 'nombre', 'monto'];

    protected $casts = [
        'monto' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
\`\`\`

**Modelo: Deuda** (\`app/Models/Deuda.php\`)

\`\`\`php
<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Deuda extends Model
{
    protected $table = 'deudas';

    protected $fillable = ['user_id', 'nombre', 'monto', 'tasa'];

    protected $casts = [
        'monto' => 'decimal:2',
        'tasa' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
\`\`\`

**Modelo: Prestamo** (\`app/Models/Prestamo.php\`)

\`\`\`php
<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Prestamo extends Model
{
    protected $table = 'prestamos';

    protected $fillable = ['user_id', 'nombre', 'monto', 'tasa'];

    protected $casts = [
        'monto' => 'decimal:2',
        'tasa' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
\`\`\`

**Modelo: MetaAhorro** (\`app/Models/MetaAhorro.php\`)

\`\`\`php
<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class MetaAhorro extends Model
{
    protected $table = 'metas_ahorro';

    protected $fillable = ['user_id', 'titulo', 'meta_monto', 'monto_actual'];

    protected $casts = [
        'meta_monto' => 'decimal:2',
        'monto_actual' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
\`\`\`

Actualizar modelo User (\`app/Models/User.php\`):

\`\`\`php
<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;
use Laravel\\Sanctum\\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'currency',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function ingresos(): HasMany
    {
        return $this->hasMany(Ingreso::class);
    }

    public function gastos(): HasMany
    {
        return $this->hasMany(Gasto::class);
    }

    public function deudas(): HasMany
    {
        return $this->hasMany(Deuda::class);
    }

    public function prestamos(): HasMany
    {
        return $this->hasMany(Prestamo::class);
    }

    public function metasAhorro(): HasMany
    {
        return $this->hasMany(MetaAhorro::class);
    }
}
\`\`\`

### Paso 7: Crear Controladores

\`\`\`bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/IngresoController --api
php artisan make:controller Api/GastoController --api
php artisan make:controller Api/DeudaController --api
php artisan make:controller Api/PrestamoController --api
php artisan make:controller Api/MetaAhorroController --api
php artisan make:controller Api/UserController
\`\`\`

**Controlador: AuthController** (\`app/Http/Controllers/Api/AuthController.php\`)

\`\`\`php
<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\User;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Validation\\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'currency' => 'CLP',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }
}
\`\`\`

**Controlador: IngresoController** (\`app/Http/Controllers/Api/IngresoController.php\`)

\`\`\`php
<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Ingreso;
use Illuminate\\Http\\Request;

class IngresoController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->ingresos;
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'monto' => 'required|numeric|min:0',
        ]);

        $ingreso = $request->user()->ingresos()->create([
            'nombre' => $request->nombre,
            'monto' => $request->monto,
        ]);

        return response()->json($ingreso, 201);
    }

    public function destroy(Request $request, $id)
    {
        $ingreso = $request->user()->ingresos()->findOrFail($id);
        $ingreso->delete();

        return response()->json(['message' => 'Ingreso eliminado'], 200);
    }
}
\`\`\`

Los controladores para Gasto, Deuda, Prestamo y MetaAhorro son similares. Aquí el de **MetaAhorroController** con la función de actualización:

\`\`\`php
<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\MetaAhorro;
use Illuminate\\Http\\Request;

class MetaAhorroController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->metasAhorro;
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'meta_monto' => 'required|numeric|min:0',
        ]);

        $meta = $request->user()->metasAhorro()->create([
            'titulo' => $request->titulo,
            'meta_monto' => $request->meta_monto,
            'monto_actual' => 0,
        ]);

        return response()->json($meta, 201);
    }

    public function update(Request $request, $id)
    {
        $meta = $request->user()->metasAhorro()->findOrFail($id);

        $request->validate([
            'monto_actual' => 'required|numeric|min:0',
        ]);

        $meta->update([
            'monto_actual' => $request->monto_actual,
        ]);

        return response()->json($meta);
    }

    public function destroy(Request $request, $id)
    {
        $meta = $request->user()->metasAhorro()->findOrFail($id);
        $meta->delete();

        return response()->json(['message' => 'Meta eliminada'], 200);
    }
}
\`\`\`

**Controlador: UserController** (\`app/Http/Controllers/Api/UserController.php\`)

\`\`\`php
<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use Illuminate\\Http\\Request;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        return $request->user();
    }

    public function updateCurrency(Request $request)
    {
        $request->validate([
            'currency' => 'required|in:CLP,USD,EUR',
        ]);

        $request->user()->update([
            'currency' => $request->currency,
        ]);

        return response()->json($request->user());
    }
}
\`\`\`

### Paso 8: Definir Rutas API

Edita \`routes/api.php\`:

\`\`\`php
<?php

use App\\Http\\Controllers\\Api\\AuthController;
use App\\Http\\Controllers\\Api\\IngresoController;
use App\\Http\\Controllers\\Api\\GastoController;
use App\\Http\\Controllers\\Api\\DeudaController;
use App\\Http\\Controllers\\Api\\PrestamoController;
use App\\Http\\Controllers\\Api\\MetaAhorroController;
use App\\Http\\Controllers\\Api\\UserController;
use Illuminate\\Support\\Facades\\Route;

// Rutas de autenticación (públicas)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Usuario
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/currency', [UserController::class, 'updateCurrency']);
    
    // Recursos financieros
    Route::apiResource('ingresos', IngresoController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('gastos', GastoController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('deudas', DeudaController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('prestamos', PrestamoController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('metas-ahorro', MetaAhorroController::class)->only(['index', 'store', 'update', 'destroy']);
});
\`\`\`

### Paso 9: Iniciar servidor Laravel

\`\`\`bash
php artisan serve
\`\`\`

Tu API estará disponible en \`http://localhost:8000\`.

---

## Parte 2: Configurar Frontend Next.js

### Paso 1: Configurar variables de entorno

Crea un archivo \`.env.local\` en la raíz de tu proyecto Next.js:

\`\`\`env
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000/api
\`\`\`

### Paso 2: La estructura ya está lista

El proyecto ya tiene configurado:

- **lib/database-config.ts**: Configuración centralizada con \`ACTIVE_DATABASE = "LARAVEL"\`
- **lib/api-client.ts**: Cliente API completo para comunicarse con Laravel

### Paso 3: Probar la conexión

1. Inicia Laravel: \`php artisan serve\`
2. Inicia Next.js: \`npm run dev\`
3. Haz clic en "Salir" para acceder a los formularios de autenticación
4. Registra un nuevo usuario
5. Los datos se guardarán en MySQL a través de Laravel

---

## Cambiar entre bases de datos

Para cambiar rápidamente entre diferentes bases de datos, edita \`lib/database-config.ts\`:

\`\`\`typescript
// Para Laravel + MySQL
export const ACTIVE_DATABASE: DatabaseType = "LARAVEL"

// Para desarrollo local sin backend
export const ACTIVE_DATABASE: DatabaseType = "LOCAL"

// Para PostgreSQL directo
export const ACTIVE_DATABASE: DatabaseType = "POSTGRES"
\`\`\`

---

## Próximos Pasos

1. Implementar la integración del API client en los componentes
2. Añadir validaciones más robustas
3. Implementar paginación para listas grandes
4. Añadir tests unitarios y de integración
5. Configurar deploy en producción (Laravel Forge, DigitalOcean, etc.)

---

## Recursos Adicionales

- [Documentación de Laravel](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Eloquent ORM](https://laravel.com/docs/eloquent)
- [Migraciones de Laravel](https://laravel.com/docs/migrations)

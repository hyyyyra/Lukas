<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Ruta de health check para verificar conexión a BD
Route::get('/health', function () {
    try {
        // Verificar conexión a base de datos
        DB::connection()->getPdo();
        
        return response()->json([
            'status' => 'ok',
            'message' => 'Conexión exitosa con la base de datos',
            'database' => config('database.default'),
            'timestamp' => now()->toISOString(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error de conexión con la base de datos',
            'error' => $e->getMessage(),
        ], 500);
    }
});

// Rutas de autenticación
Route::prefix('auth')->group(function () {
    Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']);
    Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
    Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Rutas protegidas con autenticación
Route::middleware('auth:sanctum')->group(function () {
    // Perfil de usuario
    Route::get('/user/profile', [App\Http\Controllers\UserController::class, 'profile']);
    Route::put('/user/currency', [App\Http\Controllers\UserController::class, 'updateCurrency']);
    
    // Ingresos
    Route::apiResource('ingresos', App\Http\Controllers\IngresoController::class);
    
    // Gastos
    Route::apiResource('gastos', App\Http\Controllers\GastoController::class);
    
    // Deudas
    Route::apiResource('deudas', App\Http\Controllers\DeudaController::class);
    
    // Préstamos
    Route::apiResource('prestamos', App\Http\Controllers\PrestamoController::class);
    
    // Metas de ahorro
    Route::apiResource('metas-ahorro', App\Http\Controllers\MetaAhorroController::class);
});

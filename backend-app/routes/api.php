<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\IngresoController;
use App\Http\Controllers\GastoController;
use Illuminate\Support\Facades\Route;

// Rutas de autenticación (públicas)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/profile', function (Illuminate\Http\Request $request) {
        return $request->user();
    });

    Route::apiResource('ingresos', IngresoController::class);
    Route::apiResource('gastos', GastoController::class);
});

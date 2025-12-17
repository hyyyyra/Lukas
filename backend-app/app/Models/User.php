<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'USUARIOS';
    protected $primaryKey = 'ID_USUARIO';
    public $timestamps = false; // Solo tenemos FECHA_REGISTRO

    protected $fillable = [
        'NOMBRE',
        'APELLIDO',
        'EMAIL',
        'PASSWORD_HASH',
    ];

    protected $hidden = [
        'PASSWORD_HASH',
    ];

    // Personalizar el nombre del campo de contraseña para la autenticación
    public function getAuthPassword()
    {
        return $this->PASSWORD_HASH;
    }

    // Relaciones (ajustar nombres de claves foráneas si es necesario)
    public function ingresos()
    {
        return $this->hasMany(Ingreso::class, 'ID_USUARIO');
    }

    public function gastos()
    {
        return $this->hasMany(Gasto::class, 'ID_USUARIO');
    }
}

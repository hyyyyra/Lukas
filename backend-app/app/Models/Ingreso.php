<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ingreso extends Model
{
    protected $table = 'ingresos'; 
    protected $primaryKey = 'ID_INGRESO';
    public $timestamps = false;

    protected $fillable = [
        'TITULO_INGRESO',
        'MONTO_INGRESO',
        'ID_USUARIO',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'ID_USUARIO');
    }
}

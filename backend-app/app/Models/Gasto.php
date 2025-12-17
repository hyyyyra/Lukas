<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gasto extends Model
{
    protected $table = 'gastos';
    protected $primaryKey = 'ID_GASTO';
    public $timestamps = false;

    protected $fillable = [
        'TITULO_GASTO',
        'MONTO_GASTO',
        'ID_USUARIO',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'ID_USUARIO');
    }
}

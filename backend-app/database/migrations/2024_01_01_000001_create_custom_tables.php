<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Tabla de Usuarios personalizada
        if (!Schema::hasTable('USUARIOS')) {
            Schema::create('USUARIOS', function (Blueprint $table) {
                $table->id('ID_USUARIO'); // Clave primaria
                $table->string('NOMBRE', 100);
                $table->string('APELLIDO', 100);
                $table->string('EMAIL', 150)->unique();
                $table->string('PASSWORD_HASH');
                $table->timestamp('FECHA_REGISTRO')->useCurrent();
            });
        }

        // 2. Tabla de Ingresos
        if (!Schema::hasTable('ingresos')) {
            Schema::create('ingresos', function (Blueprint $table) {
                $table->id('ID_INGRESO');
                $table->foreignId('ID_USUARIO')->constrained('USUARIOS', 'ID_USUARIO')->onDelete('cascade');
                $table->string('TITULO_INGRESO');
                $table->decimal('MONTO_INGRESO', 10, 2);
                $table->timestamps();
            });
        }

        // 3. Tabla de Gastos
        if (!Schema::hasTable('gastos')) {
            Schema::create('gastos', function (Blueprint $table) {
                $table->id('ID_GASTO');
                $table->foreignId('ID_USUARIO')->constrained('USUARIOS', 'ID_USUARIO')->onDelete('cascade');
                $table->string('TITULO_GASTO');
                $table->decimal('MONTO_GASTO', 10, 2);
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('gastos');
        Schema::dropIfExists('ingresos');
        Schema::dropIfExists('USUARIOS');
    }
};

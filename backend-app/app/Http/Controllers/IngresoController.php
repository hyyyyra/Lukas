<?php

namespace App\Http\Controllers;

use App\Models\Ingreso;
use Illuminate\Http\Request;

class IngresoController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->ingresos;
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo_ingreso' => 'required|string|max:255',
            'monto_ingreso' => 'required|numeric|min:0',
        ]);

        $ingreso = $request->user()->ingresos()->create([
            'TITULO_INGRESO' => $request->titulo_ingreso,
            'MONTO_INGRESO' => $request->monto_ingreso,
            'ID_USUARIO' => $request->user()->ID_USUARIO,
        ]);

        return response()->json($ingreso, 201);
    }

    public function destroy(Request $request, $id)
    {
        $ingreso = $request->user()->ingresos()->where('ID_INGRESO', $id)->firstOrFail();
        $ingreso->delete();

        return response()->json(['message' => 'Ingreso eliminado'], 200);
    }
}

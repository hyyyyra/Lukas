<?php

namespace App\Http\Controllers;

use App\Models\Gasto;
use Illuminate\Http\Request;

class GastoController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->gastos;
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo_gasto' => 'required|string|max:255',
            'monto_gasto' => 'required|numeric|min:0',
        ]);

        $gasto = $request->user()->gastos()->create([
            'TITULO_GASTO' => $request->titulo_gasto,
            'MONTO_GASTO' => $request->monto_gasto,
            'ID_USUARIO' => $request->user()->ID_USUARIO,
        ]);

        return response()->json($gasto, 201);
    }

    public function destroy(Request $request, $id)
    {
        $gasto = $request->user()->gastos()->where('ID_GASTO', $id)->firstOrFail();
        $gasto->delete();

        return response()->json(['message' => 'Gasto eliminado'], 200);
    }
}

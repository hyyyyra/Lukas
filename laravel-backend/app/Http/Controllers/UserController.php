<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UserService;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json($user);
    }

    public function updateCurrency(Request $request)
    {
        $request->validate([
            'currency' => 'required|string|max:3',
        ]);

        $service = app(UserService::class);
        $updated = $service->updateCurrency($request->user()->id, $request->currency);

        return response()->json($updated);
    }
}
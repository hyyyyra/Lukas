<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class UserService
{
    private UserRepository $repo;

    public function __construct(UserRepository $repo = null)
    {
        $this->repo = $repo ?? new UserRepository();
    }

    public function register(string $name, string $email, string $password): array
    {
        dd("Entra a función del registro");
        $existing = $this->repo->findByEmail($email);
        if ($existing) {
            throw ValidationException::withMessages([
                'email' => ['El email ya está registrado.'],
            ]);
        }

        $user = $this->repo->create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'currency' => 'CLP',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user,
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = $this->repo->findByEmail($email);
        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user,
        ];
    }

    public function profile(int $id): ?User
    {
        return $this->repo->findById($id);
    }

    public function updateCurrency(int $id, string $currency): ?User
    {
        return $this->repo->updateCurrency($id, $currency);
    }
}
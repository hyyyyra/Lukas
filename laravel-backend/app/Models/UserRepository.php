<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function updateCurrency(int $id, string $currency): ?User
    {
        $user = User::find($id);
        if (!$user) {
            return null;
        }
        $user->currency = $currency;
        $user->save();
        return $user;
    }
}
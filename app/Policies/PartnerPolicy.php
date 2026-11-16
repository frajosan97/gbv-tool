<?php

namespace App\Policies;

use App\Models\Partner;
use App\Models\User;

class PartnerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->partner_id !== null;
    }

    public function view(User $user, Partner $partner): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->partner_id !== null
            && (int) $user->partner_id === (int) $partner->id;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    public function update(User $user, Partner $partner): bool
    {
        return $this->view($user, $partner);
    }

    public function delete(User $user, Partner $partner): bool
    {
        return $user->isSuperAdmin();
    }

    public function verify(User $user, Partner $partner): bool
    {
        return $user->isSuperAdmin();
    }

    public function print(User $user, Partner $partner): bool
    {
        return $this->view($user, $partner);
    }

    public function export(User $user): bool
    {
        return $user->isSuperAdmin() || $user->partner_id !== null;
    }

    public function restore(User $user, Partner $partner): bool
    {
        return $user->isSuperAdmin();
    }

    public function forceDelete(User $user, Partner $partner): bool
    {
        return $user->isSuperAdmin();
    }
}
<?php

namespace App\Policies;

use App\Models\GbvCase;
use App\Models\Perpetrator;
use App\Models\User;

class PerpetratorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin()
            || $user->can('manage gbv cases')
            || $user->can('view gbv cases');
    }

    public function view(User $user, Perpetrator $perpetrator): bool
    {
        $case = $perpetrator->gbvCase;

        return $case instanceof GbvCase && $user->can('view', $case);
    }

    public function create(User $user, ?GbvCase $gbvCase = null): bool
    {
        if ($gbvCase && !$user->can('update', $gbvCase)) {
            return false;
        }

        return $user->isSuperAdmin()
            || $user->can('manage gbv cases')
            || $user->can('create gbv cases');
    }

    public function update(User $user, Perpetrator $perpetrator): bool
    {
        $case = $perpetrator->gbvCase;

        return $case instanceof GbvCase && $user->can('update', $case);
    }

    public function delete(User $user, Perpetrator $perpetrator): bool
    {
        $case = $perpetrator->gbvCase;

        return $case instanceof GbvCase && $user->can('delete', $case);
    }

    public function restore(User $user, Perpetrator $perpetrator): bool
    {
        return $this->delete($user, $perpetrator);
    }

    public function forceDelete(User $user, Perpetrator $perpetrator): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $case = $perpetrator->gbvCase;

        return $case instanceof GbvCase
            && $user->can('manage gbv cases');
    }
}
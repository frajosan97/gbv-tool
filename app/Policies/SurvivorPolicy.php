<?php

namespace App\Policies;

use App\Models\Survivor;
use App\Models\User;

class SurvivorPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage survivors') || $user->can('view survivors');
    }

    public function view(User $user, Survivor $survivor): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->can('manage survivors')) {
            return true;
        }

        if ($user->can('view survivors')) {
            if (
                $user->partner_id
                && (int) $survivor->partner_id === (int) $user->partner_id
            ) {
                return true;
            }

            if ($this->userIsOnCase($user, $survivor)) {
                return true;
            }

            if (!$user->partner_id) {
                return !$survivor->anonymous;
            }

            return false;
        }

        return (int) $user->id === (int) $survivor->created_by;
    }

    public function create(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage survivors') || $user->can('create survivors');
    }

    public function update(User $user, Survivor $survivor): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->can('manage survivors')) {
            return true;
        }

        if ($user->partner_id) {
            return (int) $survivor->partner_id === (int) $user->partner_id;
        }

        return (int) $user->id === (int) $survivor->created_by;
    }

    public function delete(User $user, Survivor $survivor): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage survivors')
            || ($user->partner_id
                && (int) $survivor->partner_id === (int) $user->partner_id);
    }

    public function restore(User $user, Survivor $survivor): bool
    {
        return $this->delete($user, $survivor);
    }

    public function export(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage survivors') || $user->can('view survivors');
    }

    public function print(User $user, Survivor $survivor): bool
    {
        return $this->view($user, $survivor);
    }

    private function userIsOnCase(User $user, Survivor $survivor): bool
    {
        return $survivor->gbvCases()
            ->where(function ($q) use ($user) {
                $q->where('primary_officer_id', $user->id)
                    ->orWhere('created_by', $user->id);
            })
            ->exists();
    }
}
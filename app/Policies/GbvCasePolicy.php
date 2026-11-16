<?php

namespace App\Policies;

use App\Models\GbvCase;
use App\Models\User;

class GbvCasePolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage gbv cases') || $user->can('view gbv cases');
    }

    public function view(User $user, GbvCase $case): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->can('manage gbv cases')) {
            return true;
        }

        // Receiving partner — has at least one referral pointing at this case.
        // They get read-only access to understand the survivor's situation.
        if ($this->isReceivingPartnerFor($user, $case)) {
            return true;
        }

        if ($user->can('view gbv cases')) {
            if ($user->partner_id) {
                return (int) $case->partner_id === (int) $user->partner_id;
            }

            return true;
        }

        return (int) $user->id === (int) $case->created_by
            || (int) $user->id === (int) $case->primary_officer_id;
    }

    public function create(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage gbv cases') || $user->can('create gbv cases');
    }

    public function update(User $user, GbvCase $case): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->can('manage gbv cases')) {
            return true;
        }

        // Receiving partners NEVER get update rights on the parent case —
        // they act only through their referral (status + feedback).
        if ($this->isReceivingPartnerFor($user, $case)) {
            return false;
        }

        if ($user->partner_id) {
            return (int) $case->partner_id === (int) $user->partner_id;
        }

        return (int) $user->id === (int) $case->created_by
            || (int) $user->id === (int) $case->primary_officer_id;
    }

    public function delete(User $user, GbvCase $case): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage gbv cases')
            || ($user->partner_id
                && (int) $case->partner_id === (int) $user->partner_id);
    }

    public function restore(User $user, GbvCase $case): bool
    {
        return $this->delete($user, $case);
    }

    public function export(User $user): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage gbv cases') || $user->can('view gbv cases');
    }

    public function print(User $user, GbvCase $case): bool
    {
        return $this->view($user, $case);
    }

    public function conclude(User $user, GbvCase $case): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->can('manage gbv cases')
            || ($user->partner_id
                && (int) $case->partner_id === (int) $user->partner_id);
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */
    private function isReceivingPartnerFor(User $user, GbvCase $case): bool
    {
        if (!$user->partner_id) {
            return false;
        }

        if ((int) $case->partner_id === (int) $user->partner_id) {
            return false;
        }

        return $case->referrals()
            ->where('to_partner_id', $user->partner_id)
            ->exists();
    }
}
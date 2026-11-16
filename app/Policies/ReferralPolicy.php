<?php

namespace App\Policies;

use App\Enums\ReferralStatus;
use App\Models\GbvCase;
use App\Models\Referral;
use App\Models\User;

class ReferralPolicy
{
    /* ------------------------------------------------------------------ */
    /* Queries                                                             */
    /* ------------------------------------------------------------------ */

    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin()
            || $user->can('manage gbv cases')
            || $user->can('view gbv cases')
            || $user->partner_id !== null;
    }

    public function view(User $user, Referral $referral): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($this->isReceivingPartner($user, $referral)) {
            return true;
        }

        $case = $referral->gbvCase;

        return $case instanceof GbvCase && $user->can('view', $case);
    }

    /* ------------------------------------------------------------------ */
    /* Mutations                                                           */
    /* ------------------------------------------------------------------ */

    public function create(User $user, ?GbvCase $gbvCase = null): bool
    {
        if ($gbvCase && !$user->can('update', $gbvCase)) {
            return false;
        }

        return $user->isSuperAdmin()
            || $user->can('manage gbv cases')
            || $user->can('create gbv cases');
    }

    public function update(User $user, Referral $referral): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($this->isReceivingPartner($user, $referral)) {
            return !$referral->status?->isTerminal();
        }

        $case = $referral->gbvCase;

        if (!$case instanceof GbvCase) {
            return false;
        }

        if (!$user->can('update', $case)) {
            return false;
        }

        // Once the receiver has accepted or completed the referral, the
        // sender is read-only.
        if (
            $referral->status === ReferralStatus::Accepted
            || $referral->status === ReferralStatus::Completed
        ) {
            return false;
        }

        return true;
    }

    /**
     * Only the user who created the referral (or a super-admin) can
     * delete it. Receiving partners cannot.
     */
    public function delete(User $user, Referral $referral): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $referral->created_by !== null
            && (int) $referral->created_by === (int) $user->id;
    }

    public function restore(User $user, Referral $referral): bool
    {
        return $this->delete($user, $referral);
    }

    public function forceDelete(User $user, Referral $referral): bool
    {
        return $user->isSuperAdmin();
    }

    /* ------------------------------------------------------------------ */
    /* Helpers                                                             */
    /* ------------------------------------------------------------------ */

    public function isReceivingPartner(User $user, Referral $referral): bool
    {
        if (!$user->partner_id || !$referral->to_partner_id) {
            return false;
        }

        if ((int) $user->partner_id !== (int) $referral->to_partner_id) {
            return false;
        }

        if (
            $referral->from_partner_id
            && (int) $user->partner_id === (int) $referral->from_partner_id
        ) {
            return false;
        }

        return true;
    }
}
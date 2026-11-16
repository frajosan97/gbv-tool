<?php

namespace App\Policies;

use App\Models\CaseNote;
use App\Models\GbvCase;
use App\Models\User;

class CaseNotePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin()
            || $user->can('manage gbv cases')
            || $user->can('view gbv cases');
    }

    public function view(User $user, CaseNote $note): bool
    {
        $case = $note->gbvCase;

        if (!$case instanceof GbvCase || !$user->can('view', $case)) {
            return false;
        }

        // Private notes are only visible to their author or users
        // explicitly granted the privacy bypass permission.
        if ($note->is_private && $note->created_by !== $user->id) {
            return $user->isSuperAdmin()
                || $user->can('view private case notes');
        }

        return true;
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

    public function update(User $user, CaseNote $note): bool
    {
        $case = $note->gbvCase;

        if (!$case instanceof GbvCase || !$user->can('update', $case)) {
            return false;
        }

        // Only the author or a super admin can edit a note — notes are
        // an audit trail, so we don't let unrelated staff rewrite them.
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $note->created_by === $user->id;
    }

    public function delete(User $user, CaseNote $note): bool
    {
        $case = $note->gbvCase;

        if (!$case instanceof GbvCase || !$user->can('delete', $case)) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $note->created_by === $user->id;
    }

    public function restore(User $user, CaseNote $note): bool
    {
        return $this->delete($user, $note);
    }

    public function forceDelete(User $user, CaseNote $note): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        $case = $note->gbvCase;

        return $case instanceof GbvCase
            && $user->can('manage gbv cases');
    }
}
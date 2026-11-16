<?php

namespace App\Enums;

enum ReferralStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Declined = 'declined';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Accepted => 'Accepted',
            self::Declined => 'Declined',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    public function isOpen(): bool
    {
        return in_array($this, [self::Pending, self::Accepted], true);
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Declined, self::Cancelled], true);
    }
}
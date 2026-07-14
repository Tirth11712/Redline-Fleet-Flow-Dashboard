<?php

namespace App\Enums;

enum TripStatus: string
{
    case DRAFT = 'Draft';
    case DISPATCHED = 'Dispatched';
    case IN_PROGRESS = 'In Progress';
    case COMPLETED = 'Completed';
    case CANCELLED = 'Cancelled';

    public function canTransitionTo(self $next): bool
    {
        return match ($this) {
            self::DRAFT => in_array($next, [self::DISPATCHED, self::CANCELLED]),
            self::DISPATCHED => in_array($next, [self::IN_PROGRESS, self::COMPLETED, self::CANCELLED]),
            self::IN_PROGRESS => in_array($next, [self::COMPLETED, self::CANCELLED]),
            self::COMPLETED, self::CANCELLED => false,
        };
    }
}

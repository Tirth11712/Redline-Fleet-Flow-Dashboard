<?php

namespace App\Enums;

enum DriverStatus: string
{
    case ON_DUTY = 'On Duty';
    case ON_TRIP = 'On Trip';
    case OFF_DUTY = 'Off Duty';
    case SUSPENDED = 'Suspended';
}

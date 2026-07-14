<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case AVAILABLE = 'Available';
    case ON_TRIP = 'On Trip';
    case IN_SHOP = 'In Shop';
    case RETIRED = 'Retired';
}

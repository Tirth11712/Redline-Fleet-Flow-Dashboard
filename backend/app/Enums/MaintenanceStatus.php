<?php

namespace App\Enums;

enum MaintenanceStatus: string
{
    case OPEN = 'Open';
    case CLOSED = 'Closed';
}

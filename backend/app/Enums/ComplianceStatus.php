<?php

namespace App\Enums;

enum ComplianceStatus: string
{
    case PENDING = 'pending';
    case COMPLIANT = 'compliant';
    case NON_COMPLIANT = 'non_compliant';
    case EXPIRED = 'expired';
}

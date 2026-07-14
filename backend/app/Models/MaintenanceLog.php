<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\MaintenanceStatus;

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'type', 'description', 'cost',
        'odometer_at_service', 'opened_at', 'closed_at',
        'status', 'service_provider', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'odometer_at_service' => 'decimal:2',
            'opened_at' => 'date',
            'closed_at' => 'date',
            'status' => MaintenanceStatus::class ,
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', MaintenanceStatus::OPEN);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', MaintenanceStatus::OPEN)
            ->where('opened_at', '>=', now())
            ->orderBy('opened_at');
    }
}

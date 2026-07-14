<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'driver_id', 'trip_id',
        'liters', 'cost_per_liter', 'total_cost',
        'odometer_km', 'date', 'station', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'liters' => 'decimal:2',
            'cost_per_liter' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'odometer_km' => 'decimal:2',
            'date' => 'date',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}

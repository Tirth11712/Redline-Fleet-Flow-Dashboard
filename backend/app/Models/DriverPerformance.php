<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverPerformance extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id', 'period', 'trips_completed',
        'distance_covered', 'fuel_consumed',
        'safety_incidents', 'rating',
    ];

    protected function casts(): array
    {
        return [
            'distance_covered' => 'decimal:2',
            'fuel_consumed' => 'decimal:2',
            'rating' => 'decimal:2',
        ];
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function getFuelEfficiencyAttribute(): float
    {
        if ($this->fuel_consumed <= 0)
            return 0;
        return round($this->distance_covered / $this->fuel_consumed, 2);
    }
}

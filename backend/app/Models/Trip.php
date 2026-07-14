<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\TripStatus;

class Trip extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ref)) {
                $model->ref = 'TRP-' . strtoupper(substr(uniqid(), -6));
            }
        });
    }

    protected $fillable = [
        'ref', 'vehicle_id', 'driver_id', 'origin', 'destination',
        'distance_km', 'cargo_kg', 'cargo_description', 'status',
        'date', 'scheduled_at', 'started_at', 'completed_at',
        'cost', 'revenue', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => TripStatus::class ,
            'distance_km' => 'decimal:2',
            'cargo_kg' => 'decimal:2',
            'cost' => 'decimal:2',
            'revenue' => 'decimal:2',
            'date' => 'date',
            'scheduled_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    // Relationships
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class);
    }

    public function expenseLogs()
    {
        return $this->hasMany(ExpenseLog::class);
    }

    // Scopes
    public function scopeByStatus($query, TripStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [TripStatus::DISPATCHED, TripStatus::IN_PROGRESS]);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', TripStatus::COMPLETED);
    }

    // Helpers
    public function canTransitionTo(TripStatus $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    public function calculateCost(): float
    {
        $fuelCost = $this->fuelLogs()->sum('total_cost');
        $expenseCost = $this->expenseLogs()->sum('amount');
        return $fuelCost + $expenseCost;
    }
}

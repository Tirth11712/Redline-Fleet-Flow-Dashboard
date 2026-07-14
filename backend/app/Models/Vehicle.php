<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\VehicleStatus;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'license_plate', 'make', 'model', 'year', 'type',
        'capacity_kg', 'odometer_km', 'acquisition_cost', 'region', 'status', 'fuel_type',
        'vin', 'insurance_expiry', 'registration_expiry', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'capacity_kg' => 'decimal:2',
            'odometer_km' => 'decimal:2',
            'acquisition_cost' => 'decimal:2',
            'status' => VehicleStatus::class ,
            'insurance_expiry' => 'date',
            'registration_expiry' => 'date',
        ];
    }

    // Relationships
    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function maintenanceLogs()
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class);
    }

    public function expenseLogs()
    {
        return $this->hasMany(ExpenseLog::class);
    }

    public function complianceRecords()
    {
        return $this->hasMany(ComplianceRecord::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', VehicleStatus::AVAILABLE);
    }

    public function scopeByStatus($query, VehicleStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Helpers
    public function isAvailable(): bool
    {
        return $this->status === VehicleStatus::AVAILABLE;
    }

    public function canCarry(float $weightKg): bool
    {
        return $this->capacity_kg >= $weightKg;
    }
}

<?php

namespace App\Services;

use App\Models\Driver;
use App\Enums\DriverStatus;
use Illuminate\Pagination\LengthAwarePaginator;

class DriverService
{
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Driver::with('user');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('license_number', 'like', "%{$filters['search']}%")
                    ->orWhere('phone', 'like', "%{$filters['search']}%")
                    ->orWhereHas('user', function ($uq) use ($filters) {
                    $uq->where('name', 'like', "%{$filters['search']}%");
                }
                );
            });
        }
        if (isset($filters['license_valid'])) {
            $query->where('license_expiry', '>', now());
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    public function create(array $data): Driver
    {
        return Driver::create($data);
    }

    public function update(Driver $driver, array $data): Driver
    {
        $driver->update($data);
        return $driver->fresh();
    }

    public function delete(Driver $driver): bool
    {
        return $driver->delete();
    }

    public function setStatus(Driver $driver, DriverStatus $status): Driver
    {
        $driver->update(['status' => $status]);
        return $driver->fresh();
    }

    public function incrementTrips(Driver $driver): void
    {
        $driver->increment('trips_completed');
    }

    public function getPerformanceSummary(Driver $driver): array
    {
        $completedTrips = $driver->trips()->where('status', 'completed')->count();
        $totalDistance = $driver->trips()->where('status', 'completed')->sum('distance_km');
        $totalFuel = $driver->fuelLogs()->sum('liters');
        $fuelEfficiency = $totalFuel > 0 ? round($totalDistance / $totalFuel, 2) : 0;

        return [
            'total_trips' => $driver->trips_completed,
            'completed_trips' => $completedTrips,
            'total_distance_km' => round($totalDistance, 2),
            'total_fuel_liters' => round($totalFuel, 2),
            'fuel_efficiency_km_per_liter' => $fuelEfficiency,
            'safety_score' => $driver->safety_score,
            'license_valid' => $driver->hasValidLicense(),
            'license_expiry' => $driver->license_expiry->format('Y-m-d'),
        ];
    }
}

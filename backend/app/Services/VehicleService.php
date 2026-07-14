<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Enums\VehicleStatus;
use Illuminate\Pagination\LengthAwarePaginator;

class VehicleService
{
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Vehicle::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (!empty($filters['fuel_type'])) {
            $query->where('fuel_type', $filters['fuel_type']);
        }
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('license_plate', 'like', "%{$filters['search']}%")
                    ->orWhere('make', 'like', "%{$filters['search']}%")
                    ->orWhere('model', 'like', "%{$filters['search']}%");
            });
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    public function create(array $data): Vehicle
    {
        return Vehicle::create($data);
    }

    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);
        return $vehicle->fresh();
    }

    public function delete(Vehicle $vehicle): bool
    {
        return $vehicle->delete();
    }

    public function setStatus(Vehicle $vehicle, VehicleStatus $status): Vehicle
    {
        $vehicle->update(['status' => $status]);
        return $vehicle->fresh();
    }

    public function calculateROI(Vehicle $vehicle): array
    {
        $totalRevenue = $vehicle->trips()->sum('revenue');
        $totalFuelCost = $vehicle->fuelLogs()->sum('total_cost');
        $totalMaintenanceCost = $vehicle->maintenanceLogs()->sum('cost');
        $totalExpenses = $vehicle->expenseLogs()->sum('amount');
        $totalCost = $totalFuelCost + $totalMaintenanceCost + $totalExpenses;
        $roi = $totalCost > 0 ? round(($totalRevenue - $totalCost) / $totalCost * 100, 2) : 0;

        return [
            'total_revenue' => round($totalRevenue, 2),
            'total_cost' => round($totalCost, 2),
            'fuel_cost' => round($totalFuelCost, 2),
            'maintenance_cost' => round($totalMaintenanceCost, 2),
            'other_expenses' => round($totalExpenses, 2),
            'roi_percentage' => $roi,
            'net_profit' => round($totalRevenue - $totalCost, 2),
        ];
    }
}

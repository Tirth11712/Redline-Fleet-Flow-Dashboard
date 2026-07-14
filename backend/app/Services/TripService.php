<?php

namespace App\Services;

use App\Models\Trip;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Enums\TripStatus;
use App\Enums\VehicleStatus;
use App\Enums\DriverStatus;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class TripService
{
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Trip::with(['vehicle', 'driver.user']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['vehicle_id'])) {
            $query->where('vehicle_id', $filters['vehicle_id']);
        }
        if (!empty($filters['driver_id'])) {
            $query->where('driver_id', $filters['driver_id']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('origin', 'like', "%{$filters['search']}%")
                    ->orWhere('destination', 'like', "%{$filters['search']}%");
            });
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    public function create(array $data): Trip
    {
        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        $driver = Driver::findOrFail($data['driver_id']);

        // Business rule: cargo weight must not exceed vehicle capacity
        if (($data['cargo_weight_kg'] ?? 0) > $vehicle->capacity_kg) {
            throw ValidationException::withMessages([
                'cargo_weight_kg' => "Cargo weight ({$data['cargo_weight_kg']} kg) exceeds vehicle capacity ({$vehicle->capacity_kg} kg).",
            ]);
        }

        // Business rule: driver must have a valid license
        if (!$driver->hasValidLicense()) {
            throw ValidationException::withMessages([
                'driver_id' => "Driver's license has expired ({$driver->license_expiry->format('Y-m-d')}). Cannot assign to trip.",
            ]);
        }

        // Business rule: vehicle must be available
        if (!$vehicle->isAvailable()) {
            throw ValidationException::withMessages([
                'vehicle_id' => "Vehicle is not available. Current status: {$vehicle->status->value}.",
            ]);
        }

        // Business rule: driver must be available
        if (!$driver->isAvailable()) {
            throw ValidationException::withMessages([
                'driver_id' => "Driver is not available. Current status: {$driver->status->value}.",
            ]);
        }

        $data['status'] = $data['status'] ?? TripStatus::DRAFT->value;

        return Trip::create($data);
    }

    public function update(Trip $trip, array $data): Trip
    {
        // Only allow updates on draft trips
        if ($trip->status !== TripStatus::DRAFT) {
            throw ValidationException::withMessages([
                'status' => 'Can only edit trips in draft status.',
            ]);
        }

        if (isset($data['cargo_weight_kg'])) {
            $vehicle = $trip->vehicle;
            if ($data['cargo_weight_kg'] > $vehicle->capacity_kg) {
                throw ValidationException::withMessages([
                    'cargo_weight_kg' => "Cargo weight exceeds vehicle capacity ({$vehicle->capacity_kg} kg).",
                ]);
            }
        }

        $trip->update($data);
        return $trip->fresh();
    }

    public function updateStatus(Trip $trip, TripStatus $newStatus): Trip
    {
        if (!$trip->canTransitionTo($newStatus)) {
            throw ValidationException::withMessages([
                'status' => "Cannot transition from '{$trip->status->value}' to '{$newStatus->value}'.",
            ]);
        }

        $updateData = ['status' => $newStatus];

        // Handle state transitions
        switch ($newStatus) {
            case TripStatus::DISPATCHED:
                // Mark vehicle and driver as on_trip
                $trip->vehicle->update(['status' => VehicleStatus::ON_TRIP]);
                $trip->driver->update(['status' => DriverStatus::ON_TRIP]);
                break;



            case TripStatus::COMPLETED:
                $updateData['completed_at'] = now();
                // Calculate cost
                $updateData['cost'] = $trip->calculateCost();
                // Free up vehicle and driver
                $trip->vehicle->update(['status' => VehicleStatus::AVAILABLE]);
                $trip->driver->update(['status' => DriverStatus::ON_DUTY]);
                $trip->driver->increment('trips_completed');
                break;

            case TripStatus::CANCELLED:
                // Free up vehicle and driver if they were assigned
                if (in_array($trip->status, [TripStatus::DISPATCHED])) {
                    $trip->vehicle->update(['status' => VehicleStatus::AVAILABLE]);
                    $trip->driver->update(['status' => DriverStatus::ON_DUTY]);
                }
                break;
        }

        $trip->update($updateData);
        return $trip->fresh(['vehicle', 'driver.user']);
    }

    public function delete(Trip $trip): bool
    {
        if ($trip->status !== TripStatus::DRAFT) {
            throw ValidationException::withMessages([
                'status' => 'Can only delete trips in draft status.',
            ]);
        }
        return $trip->delete();
    }

    public function getCostBreakdown(Trip $trip): array
    {
        $fuelCost = $trip->fuelLogs()->sum('total_cost');
        $expenses = $trip->expenseLogs()->sum('amount');

        return [
            'fuel_cost' => round($fuelCost, 2),
            'other_expenses' => round($expenses, 2),
            'total_cost' => round($fuelCost + $expenses, 2),
            'revenue' => round($trip->revenue, 2),
            'profit' => round($trip->revenue - ($fuelCost + $expenses), 2),
        ];
    }
}

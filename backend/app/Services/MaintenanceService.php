<?php

namespace App\Services;

use App\Models\MaintenanceLog;
use App\Models\Vehicle;
use App\Enums\MaintenanceStatus;
use App\Enums\VehicleStatus;
use Illuminate\Pagination\LengthAwarePaginator;

class MaintenanceService
{
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = MaintenanceLog::with('vehicle');

        if (!empty($filters['vehicle_id'])) {
            $query->where('vehicle_id', $filters['vehicle_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (!empty($filters['date_from'])) {
            $query->where('scheduled_date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->where('scheduled_date', '<=', $filters['date_to']);
        }

        $sortBy = $filters['sort_by'] ?? 'scheduled_date';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($perPage);
    }

    public function create(array $data): MaintenanceLog
    {
        $log = MaintenanceLog::create($data);

        // Auto-set vehicle to in_maintenance when maintenance starts
        if ($log->status === MaintenanceStatus::IN_PROGRESS) {
            $log->vehicle->update(['status' => VehicleStatus::IN_MAINTENANCE]);
        }

        return $log;
    }

    public function update(MaintenanceLog $log, array $data): MaintenanceLog
    {
        $oldStatus = $log->status;
        $log->update($data);
        $newStatus = $log->fresh()->status;

        // Handle vehicle status transitions
        if ($oldStatus !== $newStatus) {
            $this->handleStatusChange($log->vehicle, $newStatus);
        }

        return $log->fresh();
    }

    public function complete(MaintenanceLog $log): MaintenanceLog
    {
        $log->update([
            'status' => MaintenanceStatus::COMPLETED,
            'completed_date' => now(),
        ]);

        // Auto-restore vehicle to available
        $hasActiveMaintenace = MaintenanceLog::where('vehicle_id', $log->vehicle_id)
            ->whereIn('status', [MaintenanceStatus::SCHEDULED, MaintenanceStatus::IN_PROGRESS])
            ->where('id', '!=', $log->id)
            ->exists();

        if (!$hasActiveMaintenace) {
            $log->vehicle->update(['status' => VehicleStatus::AVAILABLE]);
        }

        return $log->fresh();
    }

    public function delete(MaintenanceLog $log): bool
    {
        return $log->delete();
    }

    private function handleStatusChange(Vehicle $vehicle, MaintenanceStatus $newStatus): void
    {
        if ($newStatus === MaintenanceStatus::IN_PROGRESS) {
            $vehicle->update(['status' => VehicleStatus::IN_MAINTENANCE]);
        }
        elseif ($newStatus === MaintenanceStatus::COMPLETED || $newStatus === MaintenanceStatus::CANCELLED) {
            $hasActiveMaintenance = MaintenanceLog::where('vehicle_id', $vehicle->id)
                ->whereIn('status', [MaintenanceStatus::SCHEDULED, MaintenanceStatus::IN_PROGRESS])
                ->exists();

            if (!$hasActiveMaintenance) {
                $vehicle->update(['status' => VehicleStatus::AVAILABLE]);
            }
        }
    }
}

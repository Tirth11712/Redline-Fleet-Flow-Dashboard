<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'vehicleId' => (string) $this->vehicle_id,
            'type' => $this->type,
            'description' => $this->description,
            'cost' => (float) $this->cost,
            'openedAt' => $this->opened_at ? $this->opened_at->format('Y-m-d') : null,
            'closedAt' => $this->closed_at ? $this->closed_at->format('Y-m-d') : null,
            'status' => $this->status->value ?? $this->status,
        ];
    }
}

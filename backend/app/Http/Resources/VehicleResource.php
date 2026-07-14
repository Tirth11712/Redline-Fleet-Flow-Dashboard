<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'reg' => $this->license_plate,
            'name' => $this->make . ' ' . $this->model,
            'type' => $this->type,
            'capacityKg' => (float) $this->capacity_kg,
            'odometerKm' => (float) $this->odometer_km,
            'acquisitionCost' => (float) $this->acquisition_cost,
            'status' => $this->status->value ?? $this->status,
            'region' => $this->region,
        ];
    }
}

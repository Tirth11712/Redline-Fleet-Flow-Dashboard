<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FuelLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'vehicleId' => (string) $this->vehicle_id,
            'liters' => (float) $this->liters,
            'cost' => (float) $this->total_cost,
            'date' => $this->date ? $this->date->format('Y-m-d') : null,
            'odometerKm' => (float) $this->odometer_km,
        ];
    }
}

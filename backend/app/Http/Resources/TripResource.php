<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'ref' => $this->ref,
            'vehicleId' => (string) $this->vehicle_id,
            'driverId' => (string) $this->driver_id,
            'origin' => $this->origin,
            'destination' => $this->destination,
            'cargoKg' => (float) $this->cargo_kg,
            'distanceKm' => (float) $this->distance_km,
            'status' => $this->status->value ?? $this->status,
            'date' => $this->date ? $this->date->format('Y-m-d') : null,
            'revenue' => (float) $this->revenue,
        ];
    }
}

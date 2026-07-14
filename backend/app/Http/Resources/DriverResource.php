<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->user ? $this->user->name : 'Unknown',
            'licenseNo' => $this->license_number,
            'licenseExpiry' => $this->license_expiry ? $this->license_expiry->format('Y-m-d') : null,
            'safetyScore' => (float) $this->safety_score,
            'status' => $this->status->value ?? $this->status,
            'tripsCompleted' => (int) $this->trips_completed,
            'region' => $this->region,
        ];
    }
}

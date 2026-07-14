<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'vehicleId' => (string) $this->vehicle_id,
            'category' => $this->category,
            'amount' => (float) $this->amount,
            'date' => $this->date ? $this->date->format('Y-m-d') : null,
            'note' => $this->note,
        ];
    }
}

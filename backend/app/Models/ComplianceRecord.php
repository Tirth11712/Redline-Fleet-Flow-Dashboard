<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\ComplianceStatus;

class ComplianceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'driver_id', 'type',
        'description', 'due_date', 'status',
        'document_path', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'status' => ComplianceStatus::class ,
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('due_date', '<=', now()->addDays($days))
            ->where('due_date', '>=', now())
            ->where('status', '!=', ComplianceStatus::COMPLIANT);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpenseLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'category', 'vehicle_id', 'trip_id',
        'amount', 'description', 'receipt_path',
        'date', 'note',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'date' => 'date',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }
}

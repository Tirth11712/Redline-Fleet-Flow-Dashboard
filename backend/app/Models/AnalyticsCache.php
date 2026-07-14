<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsCache extends Model
{
    protected $table = 'analytics_cache';

    protected $fillable = ['key', 'data', 'computed_at'];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'computed_at' => 'datetime',
        ];
    }

    public static function getCached(string $key, int $ttlMinutes = 15): ?array
    {
        $record = self::where('key', $key)->first();

        if (!$record || $record->computed_at->diffInMinutes(now()) > $ttlMinutes) {
            return null;
        }

        return $record->data;
    }

    public static function setCached(string $key, array $data): self
    {
        return self::updateOrCreate(
        ['key' => $key],
        ['data' => $data, 'computed_at' => now()]
        );
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('driver_performances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->string('period'); // e.g., '2024-01', '2024-Q1'
            $table->unsignedInteger('trips_completed')->default(0);
            $table->decimal('distance_covered', 12, 2)->default(0);
            $table->decimal('fuel_consumed', 10, 2)->default(0);
            $table->unsignedInteger('safety_incidents')->default(0);
            $table->decimal('rating', 4, 2)->default(0);
            $table->timestamps();

            $table->unique(['driver_id', 'period']);
            $table->index('period');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_performances');
    }
};

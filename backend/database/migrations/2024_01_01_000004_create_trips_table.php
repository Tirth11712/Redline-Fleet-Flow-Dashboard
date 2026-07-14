<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->string('ref')->unique();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->string('origin');
            $table->string('destination');
            $table->decimal('distance_km', 10, 2)->nullable();
            $table->decimal('cargo_kg', 10, 2)->default(0);
            $table->string('cargo_description')->nullable();
            $table->enum('status', ['Draft', 'Dispatched', 'Completed', 'Cancelled'])->default('Draft');
            $table->date('date')->nullable();
            $table->decimal('cost', 12, 2)->default(0);
            $table->decimal('revenue', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('date');
            $table->index(['vehicle_id', 'status']);
            $table->index(['driver_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};

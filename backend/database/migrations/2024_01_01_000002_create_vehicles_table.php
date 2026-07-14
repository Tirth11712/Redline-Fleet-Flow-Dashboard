<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('license_plate')->unique();
            $table->string('make');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->enum('type', ['Truck', 'Van', 'Car', 'Bus', 'Motorcycle', 'Trailer']);
            $table->decimal('capacity_kg', 10, 2);
            $table->decimal('odometer_km', 12, 2)->default(0);
            $table->decimal('acquisition_cost', 12, 2)->default(0);
            $table->string('region')->default('North');
            $table->enum('status', ['Available', 'On Trip', 'In Shop', 'Retired'])->default('Available');
            $table->enum('fuel_type', ['diesel', 'petrol', 'electric', 'hybrid', 'cng']);
            $table->string('vin')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->date('registration_expiry')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('type');
            $table->index('fuel_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};

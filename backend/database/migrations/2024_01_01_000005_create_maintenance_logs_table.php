<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['preventive', 'corrective', 'inspection', 'emergency']);
            $table->string('description');
            $table->decimal('cost', 12, 2)->default(0);
            $table->decimal('odometer_at_service', 12, 2)->nullable();
            $table->date('opened_at');
            $table->date('closed_at')->nullable();
            $table->enum('status', ['Open', 'Closed'])->default('Open');
            $table->string('service_provider')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('opened_at');
            $table->index(['vehicle_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};

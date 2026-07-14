<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('license_number')->unique();
            $table->date('license_expiry');
            $table->string('phone', 20);
            $table->enum('status', ['On Duty', 'On Trip', 'Off Duty', 'Suspended'])->default('Off Duty');
            $table->unsignedInteger('trips_completed')->default(0);
            $table->string('region')->default('North');
            $table->decimal('safety_score', 5, 2)->default(100.00);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('license_expiry');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};

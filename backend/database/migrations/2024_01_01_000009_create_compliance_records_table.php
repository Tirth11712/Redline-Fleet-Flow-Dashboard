<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('compliance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained()->onDelete('set null');
            $table->string('type'); // e.g., 'insurance', 'registration', 'emission', 'safety_check'
            $table->string('description');
            $table->date('due_date');
            $table->enum('status', ['pending', 'compliant', 'non_compliant', 'expired'])->default('pending');
            $table->string('document_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('due_date');
            $table->index('status');
            $table->index(['vehicle_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_records');
    }
};

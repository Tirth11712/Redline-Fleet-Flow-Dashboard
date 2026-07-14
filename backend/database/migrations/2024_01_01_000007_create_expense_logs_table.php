<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('expense_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['Fuel', 'Toll', 'Insurance', 'Repair', 'Permit']);
            $table->foreignId('vehicle_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('trip_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 12, 2);
            $table->string('description');
            $table->string('receipt_path')->nullable();
            $table->date('date');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('category');
            $table->index('date');
            $table->index(['vehicle_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_logs');
    }
};

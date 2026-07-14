<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('analytics_cache', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('data');
            $table->dateTime('computed_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_cache');
    }
};

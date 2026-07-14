<?php

use Illuminate\Support\Facades\Route;

// API-only backend — web routes are not used.
Route::get('/', function () {
    return response()->json(['status' => 'FleetFlow API is running.']);
});

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\VehicleController;
use App\Http\Controllers\Api\V1\DriverController;
use App\Http\Controllers\Api\V1\TripController;
use App\Http\Controllers\Api\V1\MaintenanceController;
use App\Http\Controllers\Api\V1\FuelLogController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\ComplianceController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ExportController;

// Public Routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class , 'login']);
    Route::post('register', [AuthController::class , 'register']);
});

// Protected Routes (JWT)
Route::middleware(['jwt.auth', 'throttle:60,1'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class , 'logout']);
            Route::post('refresh', [AuthController::class , 'refresh']);
            Route::get('me', [AuthController::class , 'me']);
            Route::post('password/reset', [AuthController::class , 'resetPassword']);
        }
        );

        // Dashboard
        Route::get('dashboard/kpis', [DashboardController::class , 'kpis']);

        // Vehicles
        Route::apiResource('vehicles', VehicleController::class);
        Route::get('vehicles/{vehicle}/roi', [VehicleController::class , 'roi']);

        // Drivers
        Route::apiResource('drivers', DriverController::class);
        Route::get('drivers/{driver}/performance', [DriverController::class , 'performance']);

        // Trips
        Route::apiResource('trips', TripController::class);
        Route::patch('trips/{trip}/status', [TripController::class , 'updateStatus']);
        Route::get('trips/{trip}/cost-breakdown', [TripController::class , 'costBreakdown']);

        // Maintenance
        Route::apiResource('maintenance', MaintenanceController::class);
        Route::patch('maintenance/{maintenance}/complete', [MaintenanceController::class , 'complete']);

        // Fuel Logs
        Route::apiResource('fuel-logs', FuelLogController::class);

        // Expenses
        Route::apiResource('expenses', ExpenseController::class);

        // Compliance
        Route::apiResource('compliance', ComplianceController::class);

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('fleet-performance', [AnalyticsController::class , 'fleetPerformance']);
            Route::get('financial-report', [AnalyticsController::class , 'financialReport']);
            Route::get('driver-rankings', [AnalyticsController::class , 'driverRankings']);
            Route::get('charts', [AnalyticsController::class , 'charts']);
        }
        );

        // Exports
        Route::prefix('export')->group(function () {
            Route::get('csv/vehicles', [ExportController::class , 'vehiclesCsv']);
            Route::get('csv/trips', [ExportController::class , 'tripsCsv']);
            Route::get('csv/expenses', [ExportController::class , 'expensesCsv']);
            Route::get('pdf/fleet-report', [ExportController::class , 'fleetReportPdf']);
        }
        );
    });

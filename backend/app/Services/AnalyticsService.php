<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\FuelLog;
use App\Models\ExpenseLog;
use App\Models\MaintenanceLog;
use App\Models\AnalyticsCache;
use App\Enums\TripStatus;
use App\Enums\VehicleStatus;
use App\Enums\MaintenanceStatus;

class AnalyticsService
{
    public function getDashboardKpis(): array
    {
        $cached = AnalyticsCache::getCached('dashboard_kpis', 15);
        if ($cached)
            return $cached;

        $kpis = [
            'fleet_size' => Vehicle::count(),
            'available_vehicles' => Vehicle::where('status', VehicleStatus::AVAILABLE)->count(),
            'vehicles_on_trip' => Vehicle::where('status', VehicleStatus::ON_TRIP)->count(),
            'vehicles_in_maintenance' => Vehicle::where('status', VehicleStatus::IN_MAINTENANCE)->count(),
            'total_drivers' => Driver::count(),
            'available_drivers' => Driver::where('status', 'available')->count(),
            'active_trips' => Trip::whereIn('status', [TripStatus::DISPATCHED, TripStatus::IN_PROGRESS])->count(),
            'completed_trips_this_month' => Trip::where('status', TripStatus::COMPLETED)
            ->whereMonth('completed_at', now()->month)
            ->whereYear('completed_at', now()->year)
            ->count(),
            'total_revenue_this_month' => round(Trip::where('status', TripStatus::COMPLETED)
            ->whereMonth('completed_at', now()->month)
            ->sum('revenue'), 2),
            'total_fuel_cost_this_month' => round(FuelLog::whereMonth('fueled_at', now()->month)
            ->whereYear('fueled_at', now()->year)
            ->sum('total_cost'), 2),
            'total_expenses_this_month' => round(ExpenseLog::whereMonth('expense_date', now()->month)
            ->whereYear('expense_date', now()->year)
            ->sum('amount'), 2),
            'upcoming_maintenance' => MaintenanceLog::where('status', MaintenanceStatus::SCHEDULED)
            ->where('scheduled_date', '<=', now()->addDays(7))
            ->count(),
        ];

        AnalyticsCache::setCached('dashboard_kpis', $kpis);
        return $kpis;
    }

    public function getFleetPerformance(string $period = 'month'): array
    {
        $dateFrom = match ($period) {
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                'quarter' => now()->subQuarter(),
                'year' => now()->subYear(),
                default => now()->subMonth(),
            };

        $trips = Trip::where('status', TripStatus::COMPLETED)
            ->where('completed_at', '>=', $dateFrom);

        $totalTrips = $trips->count();
        $totalDistance = $trips->sum('distance_km');
        $totalRevenue = $trips->sum('revenue');
        $totalCost = $trips->sum('cost');

        $totalFuel = FuelLog::where('fueled_at', '>=', $dateFrom)->sum('liters');
        $totalFuelCost = FuelLog::where('fueled_at', '>=', $dateFrom)->sum('total_cost');

        return [
            'period' => $period,
            'date_from' => $dateFrom->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
            'total_trips' => $totalTrips,
            'total_distance_km' => round($totalDistance, 2),
            'total_revenue' => round($totalRevenue, 2),
            'total_cost' => round($totalCost, 2),
            'net_profit' => round($totalRevenue - $totalCost, 2),
            'avg_cost_per_trip' => $totalTrips > 0 ? round($totalCost / $totalTrips, 2) : 0,
            'avg_revenue_per_trip' => $totalTrips > 0 ? round($totalRevenue / $totalTrips, 2) : 0,
            'total_fuel_liters' => round($totalFuel, 2),
            'total_fuel_cost' => round($totalFuelCost, 2),
            'fuel_efficiency_km_per_liter' => $totalFuel > 0 ? round($totalDistance / $totalFuel, 2) : 0,
        ];
    }

    public function getFinancialReport(string $period = 'month'): array
    {
        $dateFrom = match ($period) {
                'week' => now()->subWeek(),
                'month' => now()->subMonth(),
                'quarter' => now()->subQuarter(),
                'year' => now()->subYear(),
                default => now()->subMonth(),
            };

        $revenue = Trip::where('status', TripStatus::COMPLETED)
            ->where('completed_at', '>=', $dateFrom)
            ->sum('revenue');

        $fuelCost = FuelLog::where('fueled_at', '>=', $dateFrom)->sum('total_cost');
        $maintenanceCost = MaintenanceLog::where('status', MaintenanceStatus::COMPLETED)
            ->where('completed_date', '>=', $dateFrom)
            ->sum('cost');

        $expensesByCategory = ExpenseLog::where('expense_date', '>=', $dateFrom)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->pluck('total', 'category')
            ->toArray();

        $totalExpenses = array_sum($expensesByCategory);
        $totalOperationalCost = $fuelCost + $maintenanceCost + $totalExpenses;

        return [
            'period' => $period,
            'date_from' => $dateFrom->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
            'total_revenue' => round($revenue, 2),
            'fuel_cost' => round($fuelCost, 2),
            'maintenance_cost' => round($maintenanceCost, 2),
            'expenses_by_category' => $expensesByCategory,
            'total_other_expenses' => round($totalExpenses, 2),
            'total_operational_cost' => round($totalOperationalCost, 2),
            'net_profit' => round($revenue - $totalOperationalCost, 2),
            'profit_margin' => $revenue > 0 ? round(($revenue - $totalOperationalCost) / $revenue * 100, 2) : 0,
        ];
    }

    public function getDriverRankings(int $limit = 10): array
    {
        return Driver::with('user')
            ->orderByDesc('trips_completed')
            ->orderByDesc('safety_score')
            ->limit($limit)
            ->get()
            ->map(function ($driver) {
            return [
                'id' => $driver->id,
                'name' => $driver->user->name,
                'total_trips' => $driver->trips_completed,
                'safety_score' => $driver->safety_score,
                'status' => $driver->status->value,
                'license_valid' => $driver->hasValidLicense(),
            ];
        })
            ->toArray();
    }

    public function getChartData(int $months = 6): array
    {
        $cached = AnalyticsCache::getCached('chart_data_' . $months, 60);
        if ($cached) return $cached;

        $fuelEfficiency = [];
        $costPerKm = [];
        $utilizationTrend = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M');
            $yearMonth = $date->format('Y-m');

            $distance = Trip::where('status', TripStatus::COMPLETED)
                ->whereMonth('completed_at', $date->month)
                ->whereYear('completed_at', $date->year)
                ->sum('distance_km');
            $fuel = FuelLog::whereMonth('fueled_at', $date->month)
                ->whereYear('fueled_at', $date->year)
                ->sum('liters');
            
            $kpl = $fuel > 0 ? round($distance / $fuel, 2) : 0;
            $fuelEfficiency[] = ['month' => $monthName, 'kpl' => $kpl];

            $tripCost = Trip::where('status', TripStatus::COMPLETED)
                ->whereMonth('completed_at', $date->month)
                ->whereYear('completed_at', $date->year)
                ->sum('cost');
            $fuelCost = FuelLog::whereMonth('fueled_at', $date->month)
                ->whereYear('fueled_at', $date->year)
                ->sum('total_cost');
            $maintCost = MaintenanceLog::whereMonth('completed_date', $date->month)
                ->whereYear('completed_date', $date->year)
                ->sum('cost');
            $totalCost = $tripCost + $fuelCost + $maintCost;
            $cpk = $distance > 0 ? round($totalCost / $distance, 2) : 0;
            $costPerKm[] = ['month' => $monthName, 'cost' => $cpk];

            $fleetSize = max(Vehicle::count(), 1);
            $tripsCount = Trip::whereMonth('started_at', $date->month)->whereYear('started_at', $date->year)->count();
            $utilization = min(round(($tripsCount / ($fleetSize * 3)) * 100), 98); 
            $utilizationTrend[] = ['month' => $monthName, 'rate' => max($utilization, 15)];
        }

        $vehicleROI = [];
        $vehicles = Vehicle::limit(7)->get();

        foreach ($vehicles as $v) {
            $rev = (float) Trip::where('vehicle_id', $v->id)->sum('revenue');
            $cost = (float) Trip::where('vehicle_id', $v->id)->sum('cost') + 
                    (float) MaintenanceLog::where('vehicle_id', $v->id)->sum('cost') +
                    (float) FuelLog::where('vehicle_id', $v->id)->sum('total_cost');
            
            $cost = $cost ?: 1; 
            $roi = round((($rev - $cost) / $cost) * 100);
            $roi = min(max($roi, -50), 300);
            
            $vehicleROI[] = [
                'vehicle' => substr($v->make, 0, 8),
                'roi' => $roi
            ];
        }

        $data = [
            'fuelEfficiency' => $fuelEfficiency,
            'vehicleROI' => $vehicleROI,
            'costPerKm' => $costPerKm,
            'utilizationTrend' => $utilizationTrend,
        ];

        AnalyticsCache::setCached('chart_data_' . $months, $data);
        return $data;
    }
}

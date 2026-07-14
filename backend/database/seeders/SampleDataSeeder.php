<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\MaintenanceLog;
use App\Models\FuelLog;
use App\Models\ExpenseLog;
use App\Models\DriverPerformance;
use App\Models\ComplianceRecord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Users ──────────────────────────────────────────
        $manager = User::create([
            'name' => 'John Fleet Manager',
            'email' => 'manager@fleetflow.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $manager->assignRole('fleet_manager');

        $dispatcher = User::create([
            'name' => 'Jane Dispatcher',
            'email' => 'dispatcher@fleetflow.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $dispatcher->assignRole('dispatcher');

        $safety = User::create([
            'name' => 'Bob Safety Officer',
            'email' => 'safety@fleetflow.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $safety->assignRole('safety_officer');

        $analyst = User::create([
            'name' => 'Alice Financial Analyst',
            'email' => 'analyst@fleetflow.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);
        $analyst->assignRole('financial_analyst');

        // Driver users
        $driverUser1 = User::create([
            'name' => 'Carlos Rivera',
            'email' => 'carlos@fleetflow.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);

        $driverUser2 = User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@fleetflow.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);

        $driverUser3 = User::create([
            'name' => 'David Chen',
            'email' => 'david@fleetflow.com',
            'password' => Hash::make('password123'),
            'status' => 'active',
        ]);

        // ─── Vehicles ───────────────────────────────────────
        $v1 = Vehicle::create([
            'license_plate' => 'FL-1001',
            'make' => 'Volvo', 'model' => 'FH16', 'year' => 2022,
            'type' => 'Truck', 'capacity_kg' => 25000,
            'odometer_km' => 45200, 'status' => 'Available',
            'fuel_type' => 'diesel', 'vin' => 'YV2RT40A5KB123456',
            'insurance_expiry' => '2026-12-31',
            'registration_expiry' => '2027-03-15',
        ]);

        $v2 = Vehicle::create([
            'license_plate' => 'FL-1002',
            'make' => 'Mercedes-Benz', 'model' => 'Sprinter', 'year' => 2023,
            'type' => 'Van', 'capacity_kg' => 3500,
            'odometer_km' => 12800, 'status' => 'Available',
            'fuel_type' => 'diesel', 'vin' => 'WDB9066331S987654',
            'insurance_expiry' => '2026-08-20',
        ]);

        $v3 = Vehicle::create([
            'license_plate' => 'FL-1003',
            'make' => 'Toyota', 'model' => 'Hilux', 'year' => 2021,
            'type' => 'Truck', 'capacity_kg' => 1000,
            'odometer_km' => 78400, 'status' => 'Available',
            'fuel_type' => 'petrol', 'vin' => 'JTFST22P4B0112233',
            'insurance_expiry' => '2026-06-30',
        ]);

        $v4 = Vehicle::create([
            'license_plate' => 'FL-1004',
            'make' => 'Ford', 'model' => 'Transit', 'year' => 2023,
            'type' => 'Van', 'capacity_kg' => 2000,
            'odometer_km' => 5600, 'status' => 'In Shop',
            'fuel_type' => 'diesel',
        ]);

        $v5 = Vehicle::create([
            'license_plate' => 'FL-1005',
            'make' => 'Tesla', 'model' => 'Semi', 'year' => 2024,
            'type' => 'Truck', 'capacity_kg' => 36000,
            'odometer_km' => 2100, 'status' => 'Available',
            'fuel_type' => 'electric',
        ]);

        // ─── Drivers ────────────────────────────────────────
        $d1 = Driver::create([
            'user_id' => $driverUser1->id,
            'license_number' => 'CDL-2024-001',
            'license_expiry' => '2027-06-15',
            'phone' => '+1-555-0101',
            'status' => 'Off Duty',
            'trips_completed' => 152,
            'safety_score' => 95.50,
        ]);

        $d2 = Driver::create([
            'user_id' => $driverUser2->id,
            'license_number' => 'CDL-2024-002',
            'license_expiry' => '2026-09-30',
            'phone' => '+1-555-0102',
            'status' => 'Off Duty',
            'trips_completed' => 89,
            'safety_score' => 98.20,
        ]);

        $d3 = Driver::create([
            'user_id' => $driverUser3->id,
            'license_number' => 'CDL-2024-003',
            'license_expiry' => '2028-01-20',
            'phone' => '+1-555-0103',
            'status' => 'Off Duty',
            'trips_completed' => 210,
            'safety_score' => 92.80,
        ]);

        // ─── Trips ──────────────────────────────────────────
        $t1 = Trip::create([
            'ref' => 'TRP-1001',
            'vehicle_id' => $v1->id, 'driver_id' => $d1->id,
            'origin' => 'Los Angeles, CA', 'destination' => 'San Francisco, CA',
            'distance_km' => 615, 'cargo_kg' => 18000,
            'cargo_description' => 'Electronics shipment',
            'status' => 'Completed', 'cost' => 850.00, 'revenue' => 2500.00,
            'date' => now()->subDays(4),
        ]);

        $t2 = Trip::create([
            'ref' => 'TRP-1002',
            'vehicle_id' => $v2->id, 'driver_id' => $d2->id,
            'origin' => 'New York, NY', 'destination' => 'Boston, MA',
            'distance_km' => 350, 'cargo_kg' => 2000,
            'cargo_description' => 'Medical supplies',
            'status' => 'Completed', 'cost' => 320.00, 'revenue' => 900.00,
            'date' => now()->subDays(2),
        ]);

        $t3 = Trip::create([
            'ref' => 'TRP-1003',
            'vehicle_id' => $v3->id, 'driver_id' => $d3->id,
            'origin' => 'Chicago, IL', 'destination' => 'Detroit, MI',
            'distance_km' => 450, 'cargo_kg' => 800,
            'status' => 'Dispatched',
            'date' => now()->addDay(),
        ]);

        $t4 = Trip::create([
            'ref' => 'TRP-1004',
            'vehicle_id' => $v5->id, 'driver_id' => $d1->id,
            'origin' => 'Houston, TX', 'destination' => 'Dallas, TX',
            'distance_km' => 365, 'cargo_kg' => 20000,
            'cargo_description' => 'Construction materials',
            'status' => 'Draft',
            'date' => now()->addDays(3),
            'revenue' => 1800.00,
        ]);

        // ─── Maintenance Logs ───────────────────────────────
        MaintenanceLog::create([
            'vehicle_id' => $v4->id,
            'type' => 'corrective',
            'description' => 'Brake pad replacement',
            'cost' => 450.00,
            'odometer_at_service' => 5600,
            'opened_at' => now()->subDay(),
            'status' => 'Open',
            'service_provider' => 'AutoFix Garage',
        ]);

        MaintenanceLog::create([
            'vehicle_id' => $v1->id,
            'type' => 'preventive',
            'description' => 'Oil change and filter replacement',
            'cost' => 180.00,
            'odometer_at_service' => 45200,
            'opened_at' => now()->addDays(7),
            'status' => 'Open',
        ]);

        MaintenanceLog::create([
            'vehicle_id' => $v3->id,
            'type' => 'inspection',
            'description' => 'Annual safety inspection',
            'cost' => 120.00,
            'opened_at' => now()->addDays(14),
            'status' => 'Open',
        ]);

        // ─── Fuel Logs ──────────────────────────────────────
        FuelLog::create([
            'vehicle_id' => $v1->id, 'driver_id' => $d1->id, 'trip_id' => $t1->id,
            'liters' => 180, 'cost_per_liter' => 1.45, 'total_cost' => 261.00,
            'odometer_km' => 45200, 'date' => now()->subDays(5),
            'station' => 'Shell Highway Station',
        ]);

        FuelLog::create([
            'vehicle_id' => $v2->id, 'driver_id' => $d2->id, 'trip_id' => $t2->id,
            'liters' => 65, 'cost_per_liter' => 1.52, 'total_cost' => 98.80,
            'odometer_km' => 12800, 'date' => now()->subDays(3),
        ]);

        FuelLog::create([
            'vehicle_id' => $v3->id, 'driver_id' => $d3->id,
            'liters' => 50, 'cost_per_liter' => 1.60, 'total_cost' => 80.00,
            'odometer_km' => 78400, 'date' => now()->subDay(),
        ]);

        // ─── Expense Logs ───────────────────────────────────
        ExpenseLog::create([
            'category' => 'Toll', 'vehicle_id' => $v1->id, 'trip_id' => $t1->id,
            'amount' => 45.00, 'description' => 'Highway toll LA-SF',
            'date' => now()->subDays(5),
        ]);

        ExpenseLog::create([
            'category' => 'Insurance', 'vehicle_id' => $v1->id,
            'amount' => 1200.00, 'description' => 'Annual fleet insurance - Volvo FH16',
            'date' => now()->subMonth(),
        ]);

        ExpenseLog::create([
            'category' => 'Permit', 'vehicle_id' => $v2->id, 'trip_id' => $t2->id,
            'amount' => 25.00, 'description' => 'Overnight parking Boston',
            'date' => now()->subDays(2),
        ]);

        // ─── Driver Performance ─────────────────────────────
        DriverPerformance::create([
            'driver_id' => $d1->id, 'period' => now()->format('Y-m'),
            'trips_completed' => 12, 'distance_covered' => 4500,
            'fuel_consumed' => 850, 'safety_incidents' => 0, 'rating' => 4.8,
        ]);

        DriverPerformance::create([
            'driver_id' => $d2->id, 'period' => now()->format('Y-m'),
            'trips_completed' => 8, 'distance_covered' => 2800,
            'fuel_consumed' => 420, 'safety_incidents' => 0, 'rating' => 4.9,
        ]);

        DriverPerformance::create([
            'driver_id' => $d3->id, 'period' => now()->format('Y-m'),
            'trips_completed' => 15, 'distance_covered' => 5200,
            'fuel_consumed' => 980, 'safety_incidents' => 1, 'rating' => 4.5,
        ]);

        // ─── Compliance Records ─────────────────────────────
        ComplianceRecord::create([
            'vehicle_id' => $v1->id, 'type' => 'insurance',
            'description' => 'Commercial vehicle insurance',
            'due_date' => '2026-12-31', 'status' => 'compliant',
        ]);

        ComplianceRecord::create([
            'vehicle_id' => $v3->id, 'type' => 'emission',
            'description' => 'Annual emission test',
            'due_date' => now()->addDays(15), 'status' => 'pending',
        ]);

        ComplianceRecord::create([
            'vehicle_id' => $v2->id, 'driver_id' => $d2->id,
            'type' => 'safety_check',
            'description' => 'Driver safety certification renewal',
            'due_date' => now()->addDays(45), 'status' => 'pending',
        ]);
    }
}

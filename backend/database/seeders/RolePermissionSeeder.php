<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Vehicles
            'view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles',
            // Drivers
            'view_drivers', 'create_drivers', 'edit_drivers', 'delete_drivers',
            // Trips
            'view_trips', 'create_trips', 'edit_trips', 'delete_trips', 'manage_trip_status',
            // Maintenance
            'view_maintenance', 'create_maintenance', 'edit_maintenance', 'delete_maintenance',
            // Fuel
            'view_fuel_logs', 'create_fuel_logs', 'edit_fuel_logs', 'delete_fuel_logs',
            // Expenses
            'view_expenses', 'create_expenses', 'edit_expenses', 'delete_expenses',
            // Compliance
            'view_compliance', 'create_compliance', 'edit_compliance', 'delete_compliance',
            // Analytics
            'view_analytics', 'view_financial_reports', 'view_safety_reports',
            // Dashboard
            'view_dashboard',
            // Export
            'export_csv', 'export_pdf',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'api']);
        }

        // Create roles and assign permissions
        $fleetManager = Role::create(['name' => 'fleet_manager', 'guard_name' => 'api']);
        $fleetManager->givePermissionTo(Permission::all());

        $dispatcher = Role::create(['name' => 'dispatcher', 'guard_name' => 'api']);
        $dispatcher->givePermissionTo([
            'view_vehicles', 'view_drivers',
            'view_trips', 'create_trips', 'edit_trips', 'manage_trip_status',
            'view_maintenance', 'view_fuel_logs', 'view_dashboard', 'view_analytics',
        ]);

        $safetyOfficer = Role::create(['name' => 'safety_officer', 'guard_name' => 'api']);
        $safetyOfficer->givePermissionTo([
            'view_vehicles', 'view_drivers', 'edit_drivers',
            'view_trips', 'view_maintenance',
            'view_compliance', 'create_compliance', 'edit_compliance',
            'view_dashboard', 'view_safety_reports',
        ]);

        $financialAnalyst = Role::create(['name' => 'financial_analyst', 'guard_name' => 'api']);
        $financialAnalyst->givePermissionTo([
            'view_vehicles', 'view_trips', 'view_maintenance',
            'view_expenses', 'create_expenses', 'edit_expenses', 'delete_expenses',
            'view_fuel_logs',
            'view_dashboard', 'view_analytics', 'view_financial_reports',
            'export_csv', 'export_pdf',
        ]);

        $driver = Role::create(['name' => 'driver', 'guard_name' => 'api']);
        $driver->givePermissionTo([
            'view_vehicles', 'view_trips', 'create_trips', 'manage_trip_status',
            'view_fuel_logs', 'create_fuel_logs',
            'view_dashboard',
        ]);
    }
}

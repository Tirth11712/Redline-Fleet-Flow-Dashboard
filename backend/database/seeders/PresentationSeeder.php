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
use App\Models\AnalyticsCache;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class PresentationSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data — SQLite-compatible FK disable
        DB::statement('PRAGMA foreign_keys = OFF;');
        AnalyticsCache::truncate();
        ComplianceRecord::truncate();
        DriverPerformance::truncate();
        ExpenseLog::truncate();
        FuelLog::truncate();
        MaintenanceLog::truncate();
        Trip::truncate();
        Driver::truncate();
        Vehicle::truncate();
        DB::table('model_has_roles')->truncate();
        User::truncate();
        DB::statement('PRAGMA foreign_keys = ON;');

        // ─── USERS ───────────────────────────────────────────
        $admin = User::create(['name' => 'Parthiv Nanavati', 'email' => 'admin@fleetflow.com', 'password' => Hash::make('password123'), 'status' => 'active']);
        $admin->assignRole('fleet_manager');

        $manager = User::create(['name' => 'John Fleet Manager', 'email' => 'manager@fleetflow.com', 'password' => Hash::make('password123'), 'status' => 'active']);
        $manager->assignRole('fleet_manager');

        $safety = User::create(['name' => 'Bob Safety Officer', 'email' => 'safety@fleetflow.com', 'password' => Hash::make('password123'), 'status' => 'active']);
        $safety->assignRole('safety_officer');

        $analyst = User::create(['name' => 'Alice Financial Analyst', 'email' => 'analyst@fleetflow.com', 'password' => Hash::make('password123'), 'status' => 'active']);
        $analyst->assignRole('financial_analyst');

        // Driver users
        $driverUsers = [];
        $driverData = [
            ['name' => 'Carlos Rivera',   'email' => 'carlos@fleetflow.com'],
            ['name' => 'Maria Santos',    'email' => 'maria@fleetflow.com'],
            ['name' => 'David Chen',      'email' => 'david@fleetflow.com'],
            ['name' => 'Sarah Johnson',   'email' => 'sarah@fleetflow.com'],
            ['name' => 'Mike Thompson',   'email' => 'mike@fleetflow.com'],
            ['name' => 'Priya Sharma',    'email' => 'priya@fleetflow.com'],
            ['name' => 'James Wilson',    'email' => 'james@fleetflow.com'],
            ['name' => 'Emily Davis',     'email' => 'emily@fleetflow.com'],
        ];
        foreach ($driverData as $d) {
            $u = User::create(['name' => $d['name'], 'email' => $d['email'], 'password' => Hash::make('password123'), 'status' => 'active']);
            $u->assignRole('driver');
            $driverUsers[] = $u;
        }

        // ─── VEHICLES (12) ───────────────────────────────────
        // status must match VehicleStatus enum: 'Available','On Trip','In Shop','Retired'
        $vehicles = [];
        $vehicleData = [
            ['license_plate'=>'FL-1001','make'=>'Volvo',        'model'=>'FH16',      'year'=>2022,'type'=>'truck','capacity_kg'=>25000,'odometer_km'=>67500,'status'=>'On Trip',   'fuel_type'=>'diesel',  'vin'=>'YV2RT40A5KB123456','insurance_expiry'=>'2026-12-31','registration_expiry'=>'2027-03-15'],
            ['license_plate'=>'FL-1002','make'=>'Mercedes-Benz','model'=>'Sprinter',  'year'=>2023,'type'=>'van',  'capacity_kg'=>3500, 'odometer_km'=>28400,'status'=>'Available', 'fuel_type'=>'diesel',  'vin'=>'WDB9066331S987654','insurance_expiry'=>'2026-08-20','registration_expiry'=>'2027-01-10'],
            ['license_plate'=>'FL-1003','make'=>'Toyota',       'model'=>'Hilux',     'year'=>2021,'type'=>'truck','capacity_kg'=>1000, 'odometer_km'=>92800,'status'=>'Available', 'fuel_type'=>'petrol',  'vin'=>'JTFST22P4B0112233','insurance_expiry'=>'2026-06-30','registration_expiry'=>'2026-11-20'],
            ['license_plate'=>'FL-1004','make'=>'Ford',         'model'=>'Transit',   'year'=>2023,'type'=>'van',  'capacity_kg'=>2000, 'odometer_km'=>18700,'status'=>'In Shop',   'fuel_type'=>'diesel',  'vin'=>'WF0XXXGCDX1234567','insurance_expiry'=>'2027-02-28','registration_expiry'=>'2027-05-15'],
            ['license_plate'=>'FL-1005','make'=>'Tesla',        'model'=>'Semi',      'year'=>2024,'type'=>'truck','capacity_kg'=>36000,'odometer_km'=>12300,'status'=>'On Trip',   'fuel_type'=>'electric','vin'=>'5YJ3E1EA5NF000001','insurance_expiry'=>'2027-06-30','registration_expiry'=>'2027-09-01'],
            ['license_plate'=>'FL-1006','make'=>'Scania',       'model'=>'R500',      'year'=>2022,'type'=>'truck','capacity_kg'=>28000,'odometer_km'=>85600,'status'=>'Available', 'fuel_type'=>'diesel',  'vin'=>'XLER4X20005678901','insurance_expiry'=>'2026-10-15','registration_expiry'=>'2027-02-28'],
            ['license_plate'=>'FL-1007','make'=>'Isuzu',        'model'=>'NPR-HD',    'year'=>2023,'type'=>'truck','capacity_kg'=>6500, 'odometer_km'=>34200,'status'=>'Available', 'fuel_type'=>'diesel',  'vin'=>'JALC4W164M7654321','insurance_expiry'=>'2027-04-15','registration_expiry'=>'2027-07-20'],
            ['license_plate'=>'FL-1008','make'=>'Hyundai',      'model'=>'Staria',    'year'=>2024,'type'=>'van',  'capacity_kg'=>1200, 'odometer_km'=>8900, 'status'=>'On Trip',   'fuel_type'=>'hybrid',  'vin'=>'KMHXX41CAXU123456','insurance_expiry'=>'2027-08-31','registration_expiry'=>'2027-11-15'],
            ['license_plate'=>'FL-1009','make'=>'MAN',          'model'=>'TGX',       'year'=>2021,'type'=>'truck','capacity_kg'=>32000,'odometer_km'=>112400,'status'=>'Available','fuel_type'=>'diesel',  'vin'=>'WMAN08ZZ1MY987654','insurance_expiry'=>'2026-05-15','registration_expiry'=>'2026-09-30'],
            ['license_plate'=>'FL-1010','make'=>'Tata',         'model'=>'Ace Gold',  'year'=>2023,'type'=>'truck','capacity_kg'=>750,  'odometer_km'=>41500,'status'=>'Available', 'fuel_type'=>'cng',     'vin'=>'MAT447184K1234567','insurance_expiry'=>'2027-01-31','registration_expiry'=>'2027-04-30'],
            ['license_plate'=>'FL-1011','make'=>'BYD',          'model'=>'T9',        'year'=>2024,'type'=>'truck','capacity_kg'=>18000,'odometer_km'=>5200, 'status'=>'Available', 'fuel_type'=>'electric','vin'=>'LGXCE6CB5R0123456','insurance_expiry'=>'2027-12-31','registration_expiry'=>'2028-03-15'],
            ['license_plate'=>'FL-1012','make'=>'Volkswagen',   'model'=>'Crafter',   'year'=>2022,'type'=>'van',  'capacity_kg'=>2500, 'odometer_km'=>56800,'status'=>'Retired',   'fuel_type'=>'diesel',  'vin'=>'WV1ZZZ2KZMH654321','insurance_expiry'=>'2025-12-31','registration_expiry'=>'2026-03-15','notes'=>'Retired due to high mileage'],
        ];
        foreach ($vehicleData as $v) {
            $vehicles[] = Vehicle::create($v);
        }

        // ─── DRIVERS (8) ─────────────────────────────────────
        // status must match DriverStatus enum: 'On Duty','On Trip','Off Duty','Suspended'
        $drivers = [];
        $driverMeta = [
            ['license_number'=>'CDL-2024-001','license_expiry'=>'2027-06-15','phone'=>'+1-555-0101','status'=>'On Trip', 'trips_completed'=>187,'safety_score'=>96.50],
            ['license_number'=>'CDL-2024-002','license_expiry'=>'2026-09-30','phone'=>'+1-555-0102','status'=>'On Duty', 'trips_completed'=>134,'safety_score'=>98.20],
            ['license_number'=>'CDL-2024-003','license_expiry'=>'2028-01-20','phone'=>'+1-555-0103','status'=>'On Trip', 'trips_completed'=>245,'safety_score'=>93.80],
            ['license_number'=>'CDL-2024-004','license_expiry'=>'2027-11-10','phone'=>'+1-555-0104','status'=>'On Duty', 'trips_completed'=>98, 'safety_score'=>97.10],
            ['license_number'=>'CDL-2024-005','license_expiry'=>'2027-03-25','phone'=>'+1-555-0105','status'=>'On Trip', 'trips_completed'=>163,'safety_score'=>91.40],
            ['license_number'=>'CDL-2024-006','license_expiry'=>'2028-05-18','phone'=>'+1-555-0106','status'=>'On Duty', 'trips_completed'=>72, 'safety_score'=>99.00],
            ['license_number'=>'CDL-2024-007','license_expiry'=>'2026-12-01','phone'=>'+1-555-0107','status'=>'Off Duty','trips_completed'=>211,'safety_score'=>94.60],
            ['license_number'=>'CDL-2024-008','license_expiry'=>'2027-08-22','phone'=>'+1-555-0108','status'=>'On Duty', 'trips_completed'=>56, 'safety_score'=>97.80],
        ];
        foreach ($driverMeta as $i => $dm) {
            $dm['user_id'] = $driverUsers[$i]->id;
            $drivers[] = Driver::create($dm);
        }

        // ─── TRIPS (25) ──────────────────────────────────────
        // status: 'Draft','Dispatched','In Progress','Completed','Cancelled'
        // model fields: cargo_kg (not cargo_weight_kg), date (not scheduled_at for the date field)
        $trips = [];
        $tripData = [
            // Completed trips
            ['vehicle_id'=>1,'driver_id'=>1,'origin'=>'Los Angeles, CA','destination'=>'San Francisco, CA','distance_km'=>615,'cargo_kg'=>18000,'cargo_description'=>'Electronics shipment','status'=>'Completed','cost'=>1250,'revenue'=>3800,'date'=>now()->subDays(20)->toDateString(),'scheduled_at'=>now()->subDays(20),'started_at'=>now()->subDays(20),'completed_at'=>now()->subDays(19)],
            ['vehicle_id'=>2,'driver_id'=>2,'origin'=>'New York, NY','destination'=>'Boston, MA','distance_km'=>350,'cargo_kg'=>2800,'cargo_description'=>'Medical supplies','status'=>'Completed','cost'=>480,'revenue'=>1400,'date'=>now()->subDays(18)->toDateString(),'scheduled_at'=>now()->subDays(18),'started_at'=>now()->subDays(18),'completed_at'=>now()->subDays(17)],
            ['vehicle_id'=>6,'driver_id'=>3,'origin'=>'Chicago, IL','destination'=>'Detroit, MI','distance_km'=>450,'cargo_kg'=>22000,'cargo_description'=>'Auto parts','status'=>'Completed','cost'=>920,'revenue'=>2900,'date'=>now()->subDays(16)->toDateString(),'scheduled_at'=>now()->subDays(16),'started_at'=>now()->subDays(16),'completed_at'=>now()->subDays(15)],
            ['vehicle_id'=>3,'driver_id'=>4,'origin'=>'Miami, FL','destination'=>'Atlanta, GA','distance_km'=>1060,'cargo_kg'=>800,'cargo_description'=>'Perishable goods','status'=>'Completed','cost'=>1680,'revenue'=>4200,'date'=>now()->subDays(14)->toDateString(),'scheduled_at'=>now()->subDays(14),'started_at'=>now()->subDays(14),'completed_at'=>now()->subDays(12)],
            ['vehicle_id'=>7,'driver_id'=>5,'origin'=>'Seattle, WA','destination'=>'Portland, OR','distance_km'=>280,'cargo_kg'=>4500,'cargo_description'=>'Furniture delivery','status'=>'Completed','cost'=>390,'revenue'=>1100,'date'=>now()->subDays(12)->toDateString(),'scheduled_at'=>now()->subDays(12),'started_at'=>now()->subDays(12),'completed_at'=>now()->subDays(11)],
            ['vehicle_id'=>9,'driver_id'=>1,'origin'=>'Dallas, TX','destination'=>'Houston, TX','distance_km'=>365,'cargo_kg'=>28000,'cargo_description'=>'Steel beams','status'=>'Completed','cost'=>780,'revenue'=>2600,'date'=>now()->subDays(10)->toDateString(),'scheduled_at'=>now()->subDays(10),'started_at'=>now()->subDays(10),'completed_at'=>now()->subDays(9)],
            ['vehicle_id'=>2,'driver_id'=>6,'origin'=>'Philadelphia, PA','destination'=>'Washington, DC','distance_km'=>225,'cargo_kg'=>1800,'cargo_description'=>'Office equipment','status'=>'Completed','cost'=>310,'revenue'=>900,'date'=>now()->subDays(9)->toDateString(),'scheduled_at'=>now()->subDays(9),'started_at'=>now()->subDays(9),'completed_at'=>now()->subDays(8)],
            ['vehicle_id'=>10,'driver_id'=>2,'origin'=>'Denver, CO','destination'=>'Colorado Springs, CO','distance_km'=>110,'cargo_kg'=>600,'cargo_description'=>'Restaurant supplies','status'=>'Completed','cost'=>150,'revenue'=>450,'date'=>now()->subDays(8)->toDateString(),'scheduled_at'=>now()->subDays(8),'started_at'=>now()->subDays(8),'completed_at'=>now()->subDays(8)],
            ['vehicle_id'=>6,'driver_id'=>3,'origin'=>'Nashville, TN','destination'=>'Memphis, TN','distance_km'=>340,'cargo_kg'=>19000,'cargo_description'=>'Warehouse inventory','status'=>'Completed','cost'=>680,'revenue'=>2100,'date'=>now()->subDays(7)->toDateString(),'scheduled_at'=>now()->subDays(7),'started_at'=>now()->subDays(7),'completed_at'=>now()->subDays(6)],
            ['vehicle_id'=>5,'driver_id'=>5,'origin'=>'Phoenix, AZ','destination'=>'Las Vegas, NV','distance_km'=>470,'cargo_kg'=>30000,'cargo_description'=>'Consumer electronics','status'=>'Completed','cost'=>850,'revenue'=>3200,'date'=>now()->subDays(6)->toDateString(),'scheduled_at'=>now()->subDays(6),'started_at'=>now()->subDays(6),'completed_at'=>now()->subDays(5)],
            ['vehicle_id'=>7,'driver_id'=>4,'origin'=>'San Diego, CA','destination'=>'Los Angeles, CA','distance_km'=>195,'cargo_kg'=>5200,'cargo_description'=>'Clothing shipment','status'=>'Completed','cost'=>270,'revenue'=>850,'date'=>now()->subDays(5)->toDateString(),'scheduled_at'=>now()->subDays(5),'started_at'=>now()->subDays(5),'completed_at'=>now()->subDays(4)],
            ['vehicle_id'=>3,'driver_id'=>8,'origin'=>'Minneapolis, MN','destination'=>'Milwaukee, WI','distance_km'=>540,'cargo_kg'=>750,'cargo_description'=>'Brewery supplies','status'=>'Completed','cost'=>420,'revenue'=>1250,'date'=>now()->subDays(4)->toDateString(),'scheduled_at'=>now()->subDays(4),'started_at'=>now()->subDays(4),'completed_at'=>now()->subDays(3)],
            ['vehicle_id'=>9,'driver_id'=>6,'origin'=>'Charlotte, NC','destination'=>'Raleigh, NC','distance_km'=>270,'cargo_kg'=>24000,'cargo_description'=>'Building materials','status'=>'Completed','cost'=>540,'revenue'=>1700,'date'=>now()->subDays(3)->toDateString(),'scheduled_at'=>now()->subDays(3),'started_at'=>now()->subDays(3),'completed_at'=>now()->subDays(2)],
            ['vehicle_id'=>11,'driver_id'=>2,'origin'=>'Austin, TX','destination'=>'San Antonio, TX','distance_km'=>130,'cargo_kg'=>15000,'cargo_description'=>'Tech hardware','status'=>'Completed','cost'=>220,'revenue'=>750,'date'=>now()->subDays(2)->toDateString(),'scheduled_at'=>now()->subDays(2),'started_at'=>now()->subDays(2),'completed_at'=>now()->subDays(1)],
            // In-progress trips
            ['vehicle_id'=>1,'driver_id'=>1,'origin'=>'Sacramento, CA','destination'=>'Reno, NV','distance_km'=>215,'cargo_kg'=>16000,'cargo_description'=>'Agricultural equipment','status'=>'In Progress','cost'=>450,'revenue'=>1500,'date'=>now()->toDateString(),'scheduled_at'=>now()->subHours(6),'started_at'=>now()->subHours(5)],
            ['vehicle_id'=>5,'driver_id'=>3,'origin'=>'Orlando, FL','destination'=>'Jacksonville, FL','distance_km'=>225,'cargo_kg'=>32000,'cargo_description'=>'Amazon pallets','status'=>'In Progress','cost'=>380,'revenue'=>1300,'date'=>now()->toDateString(),'scheduled_at'=>now()->subHours(4),'started_at'=>now()->subHours(3)],
            ['vehicle_id'=>8,'driver_id'=>5,'origin'=>'Portland, OR','destination'=>'Boise, ID','distance_km'=>690,'cargo_kg'=>1000,'cargo_description'=>'Pharmaceutical delivery','status'=>'In Progress','cost'=>890,'revenue'=>2800,'date'=>now()->toDateString(),'scheduled_at'=>now()->subHours(8),'started_at'=>now()->subHours(7)],
            // Dispatched trips
            ['vehicle_id'=>6,'driver_id'=>4,'origin'=>'Pittsburgh, PA','destination'=>'Cleveland, OH','distance_km'=>215,'cargo_kg'=>20000,'cargo_description'=>'Steel coils','status'=>'Dispatched','cost'=>0,'revenue'=>1800,'date'=>now()->addHours(6)->toDateString(),'scheduled_at'=>now()->addHours(6)],
            ['vehicle_id'=>7,'driver_id'=>8,'origin'=>'Kansas City, MO','destination'=>'St. Louis, MO','distance_km'=>390,'cargo_kg'=>5800,'cargo_description'=>'Food distribution','status'=>'Dispatched','cost'=>0,'revenue'=>1400,'date'=>now()->addHours(12)->toDateString(),'scheduled_at'=>now()->addHours(12)],
            ['vehicle_id'=>10,'driver_id'=>6,'origin'=>'Tampa, FL','destination'=>'Savannah, GA','distance_km'=>460,'cargo_kg'=>650,'cargo_description'=>'E-commerce parcels','status'=>'Dispatched','cost'=>0,'revenue'=>1100,'date'=>now()->addDay()->toDateString(),'scheduled_at'=>now()->addDay()],
            // Draft trips
            ['vehicle_id'=>9,'driver_id'=>2,'origin'=>'Salt Lake City, UT','destination'=>'Denver, CO','distance_km'=>820,'cargo_kg'=>26000,'cargo_description'=>'Mining equipment','status'=>'Draft','cost'=>0,'revenue'=>4500,'date'=>now()->addDays(3)->toDateString(),'scheduled_at'=>now()->addDays(3)],
            ['vehicle_id'=>11,'driver_id'=>8,'origin'=>'Louisville, KY','destination'=>'Indianapolis, IN','distance_km'=>180,'cargo_kg'=>12000,'cargo_description'=>'Automotive components','status'=>'Draft','cost'=>0,'revenue'=>1200,'date'=>now()->addDays(4)->toDateString(),'scheduled_at'=>now()->addDays(4)],
            ['vehicle_id'=>3,'driver_id'=>4,'origin'=>'Tucson, AZ','destination'=>'El Paso, TX','distance_km'=>490,'cargo_kg'=>900,'cargo_description'=>'Medical devices','status'=>'Draft','cost'=>0,'revenue'=>2200,'date'=>now()->addDays(5)->toDateString(),'scheduled_at'=>now()->addDays(5)],
            // Cancelled trip
            ['vehicle_id'=>12,'driver_id'=>7,'origin'=>'Omaha, NE','destination'=>'Des Moines, IA','distance_km'=>240,'cargo_kg'=>2000,'cargo_description'=>'Retail merchandise','status'=>'Cancelled','cost'=>0,'revenue'=>0,'date'=>now()->subDays(3)->toDateString(),'scheduled_at'=>now()->subDays(3),'notes'=>'Vehicle retired'],
        ];
        foreach ($tripData as $td) {
            $td['vehicle_id'] = $vehicles[$td['vehicle_id'] - 1]->id;
            $td['driver_id']  = $drivers[$td['driver_id'] - 1]->id;
            $trips[] = Trip::create($td);
        }

        // ─── MAINTENANCE LOGS ────────────────────────────────
        // status: 'Open' or 'Closed' (MaintenanceStatus enum)
        // fields: opened_at, closed_at (not scheduled_date/completed_date)
        $maintenanceData = [
            ['vehicle_id'=>4, 'type'=>'corrective',  'description'=>'Brake pad replacement and rotor resurfacing',    'cost'=>680,  'odometer_at_service'=>18700, 'opened_at'=>now()->subDays(2),  'status'=>'Open',   'service_provider'=>'AutoFix Professional Garage'],
            ['vehicle_id'=>4, 'type'=>'corrective',  'description'=>'Transmission fluid leak repair',                 'cost'=>420,  'odometer_at_service'=>18700, 'opened_at'=>now()->subDay(),    'status'=>'Open',   'service_provider'=>'AutoFix Professional Garage'],
            ['vehicle_id'=>1, 'type'=>'preventive',  'description'=>'Oil change, filter replacement, and fluid top-up','cost'=>280, 'odometer_at_service'=>67500, 'opened_at'=>now()->addDays(5),  'status'=>'Open',   'service_provider'=>'Volvo Authorized Service Center'],
            ['vehicle_id'=>6, 'type'=>'preventive',  'description'=>'Tire rotation and alignment check',               'cost'=>350, 'odometer_at_service'=>85600, 'opened_at'=>now()->addDays(8),  'status'=>'Open',   'service_provider'=>'TirePlus Fleet Services'],
            ['vehicle_id'=>9, 'type'=>'inspection',  'description'=>'DOT annual safety inspection',                    'cost'=>200, 'odometer_at_service'=>112400,'opened_at'=>now()->addDays(12), 'status'=>'Open',   'service_provider'=>'State Inspection Center'],
            ['vehicle_id'=>3, 'type'=>'preventive',  'description'=>'Engine tune-up and spark plug replacement',       'cost'=>450, 'odometer_at_service'=>92800, 'opened_at'=>now()->addDays(15), 'status'=>'Open'],
            ['vehicle_id'=>7, 'type'=>'inspection',  'description'=>'Emission compliance test',                        'cost'=>150, 'odometer_at_service'=>34200, 'opened_at'=>now()->addDays(20), 'status'=>'Open',   'service_provider'=>'Green Fleet Testing'],
            ['vehicle_id'=>1, 'type'=>'preventive',  'description'=>'Full service - 60,000km interval',                'cost'=>1200,'odometer_at_service'=>60000, 'opened_at'=>now()->subDays(30), 'closed_at'=>now()->subDays(28),'status'=>'Closed','service_provider'=>'Volvo Authorized Service Center'],
            ['vehicle_id'=>2, 'type'=>'corrective',  'description'=>'AC compressor replacement',                       'cost'=>890, 'odometer_at_service'=>22000, 'opened_at'=>now()->subDays(25), 'closed_at'=>now()->subDays(23),'status'=>'Closed','service_provider'=>'Mercedes-Benz Workshop'],
            ['vehicle_id'=>5, 'type'=>'inspection',  'description'=>'Battery health diagnostic',                       'cost'=>0,   'odometer_at_service'=>8000,  'opened_at'=>now()->subDays(20), 'closed_at'=>now()->subDays(20),'status'=>'Closed','service_provider'=>'Tesla Service Center'],
            ['vehicle_id'=>9, 'type'=>'corrective',  'description'=>'Suspension spring replacement',                   'cost'=>1500,'odometer_at_service'=>105000,'opened_at'=>now()->subDays(45), 'closed_at'=>now()->subDays(42),'status'=>'Closed','service_provider'=>'Heavy Duty Truck Repair'],
            ['vehicle_id'=>10,'type'=>'preventive',  'description'=>'CNG tank inspection and valve service',            'cost'=>320, 'odometer_at_service'=>35000, 'opened_at'=>now()->subDays(15), 'closed_at'=>now()->subDays(15),'status'=>'Closed','service_provider'=>'CNG Fleet Solutions'],
            ['vehicle_id'=>12,'type'=>'emergency',   'description'=>'Engine overheating - radiator failure',            'cost'=>2800,'odometer_at_service'=>56800, 'opened_at'=>now()->subDays(60), 'closed_at'=>now()->subDays(55),'status'=>'Closed','service_provider'=>'Emergency Fleet Repair','notes'=>'Led to vehicle retirement'],
            ['vehicle_id'=>8, 'type'=>'preventive',  'description'=>'Hybrid system software update',                   'cost'=>0,   'odometer_at_service'=>6000,  'opened_at'=>now()->subDays(10), 'closed_at'=>now()->subDays(10),'status'=>'Closed','service_provider'=>'Hyundai Dealer'],
            ['vehicle_id'=>11,'type'=>'inspection',  'description'=>'Pre-delivery inspection and calibration',          'cost'=>0,   'odometer_at_service'=>200,   'opened_at'=>now()->subDays(90), 'closed_at'=>now()->subDays(90),'status'=>'Closed','service_provider'=>'BYD Authorized Dealer'],
        ];
        foreach ($maintenanceData as $m) {
            $m['vehicle_id'] = $vehicles[$m['vehicle_id'] - 1]->id;
            MaintenanceLog::create($m);
        }

        // ─── FUEL LOGS ───────────────────────────────────────
        // model fields: odometer_km (not odometer), date (not fueled_at)
        $fuelData = [
            ['vehicle_id'=>1, 'driver_id'=>1,'trip_id'=>1,  'liters'=>180,'cost_per_liter'=>1.45,'total_cost'=>261.00,'odometer_km'=>48000,'date'=>now()->subDays(20),'station'=>'Shell Highway - Bakersfield'],
            ['vehicle_id'=>2, 'driver_id'=>2,'trip_id'=>2,  'liters'=>55, 'cost_per_liter'=>1.52,'total_cost'=>83.60, 'odometer_km'=>24000,'date'=>now()->subDays(18),'station'=>'BP Station - Newark'],
            ['vehicle_id'=>6, 'driver_id'=>3,'trip_id'=>3,  'liters'=>160,'cost_per_liter'=>1.48,'total_cost'=>236.80,'odometer_km'=>78000,'date'=>now()->subDays(16),'station'=>'Pilot Travel Center - Gary'],
            ['vehicle_id'=>3, 'driver_id'=>4,'trip_id'=>4,  'liters'=>95, 'cost_per_liter'=>1.55,'total_cost'=>147.25,'odometer_km'=>86000,'date'=>now()->subDays(14),'station'=>'Sunoco - Fort Lauderdale'],
            ['vehicle_id'=>3, 'driver_id'=>4,'trip_id'=>4,  'liters'=>85, 'cost_per_liter'=>1.50,'total_cost'=>127.50,'odometer_km'=>87000,'date'=>now()->subDays(13),'station'=>'Circle K - Valdosta'],
            ['vehicle_id'=>7, 'driver_id'=>5,'trip_id'=>5,  'liters'=>48, 'cost_per_liter'=>1.42,'total_cost'=>68.16, 'odometer_km'=>30500,'date'=>now()->subDays(12),'station'=>'Chevron - Tacoma'],
            ['vehicle_id'=>9, 'driver_id'=>1,'trip_id'=>6,  'liters'=>145,'cost_per_liter'=>1.38,'total_cost'=>200.10,'odometer_km'=>108000,'date'=>now()->subDays(10),'station'=>"Love's Travel Stop - Waco"],
            ['vehicle_id'=>2, 'driver_id'=>6,'trip_id'=>7,  'liters'=>40, 'cost_per_liter'=>1.58,'total_cost'=>63.20, 'odometer_km'=>26000,'date'=>now()->subDays(9), 'station'=>'Wawa - King of Prussia'],
            ['vehicle_id'=>10,'driver_id'=>2,'trip_id'=>8,  'liters'=>18, 'cost_per_liter'=>1.20,'total_cost'=>21.60, 'odometer_km'=>38000,'date'=>now()->subDays(8), 'station'=>'CNG Station - Denver'],
            ['vehicle_id'=>6, 'driver_id'=>3,'trip_id'=>9,  'liters'=>120,'cost_per_liter'=>1.44,'total_cost'=>172.80,'odometer_km'=>82000,'date'=>now()->subDays(7), 'station'=>'Flying J - Nashville'],
            ['vehicle_id'=>7, 'driver_id'=>4,'trip_id'=>11, 'liters'=>35, 'cost_per_liter'=>1.60,'total_cost'=>56.00, 'odometer_km'=>32000,'date'=>now()->subDays(5), 'station'=>'Arco - Oceanside'],
            ['vehicle_id'=>3, 'driver_id'=>8,'trip_id'=>12, 'liters'=>70, 'cost_per_liter'=>1.47,'total_cost'=>102.90,'odometer_km'=>90000,'date'=>now()->subDays(4), 'station'=>'Kwik Trip - Rochester'],
            ['vehicle_id'=>9, 'driver_id'=>6,'trip_id'=>13, 'liters'=>110,'cost_per_liter'=>1.41,'total_cost'=>155.10,'odometer_km'=>110000,'date'=>now()->subDays(3),'station'=>'Sheetz - Greensboro'],
            ['vehicle_id'=>1, 'driver_id'=>1,'trip_id'=>15, 'liters'=>75, 'cost_per_liter'=>1.49,'total_cost'=>111.75,'odometer_km'=>67000,'date'=>now()->subHours(6),'station'=>'76 Station - Sacramento'],
            ['vehicle_id'=>8, 'driver_id'=>5,'trip_id'=>17, 'liters'=>25, 'cost_per_liter'=>1.55,'total_cost'=>38.75, 'odometer_km'=>8500, 'date'=>now()->subHours(8),'station'=>'Shell - Portland'],
            ['vehicle_id'=>4, 'driver_id'=>7,'trip_id'=>null,'liters'=>60,'cost_per_liter'=>1.50,'total_cost'=>90.00, 'odometer_km'=>17000,'date'=>now()->subDays(35),'station'=>'Costco Gas - Phoenix'],
            ['vehicle_id'=>6, 'driver_id'=>3,'trip_id'=>null,'liters'=>200,'cost_per_liter'=>1.40,'total_cost'=>280.00,'odometer_km'=>75000,'date'=>now()->subDays(22),'station'=>'TA Truck Stop - Memphis'],
            ['vehicle_id'=>1, 'driver_id'=>1,'trip_id'=>null,'liters'=>190,'cost_per_liter'=>1.46,'total_cost'=>277.40,'odometer_km'=>55000,'date'=>now()->subDays(40),'station'=>'Pilot - Barstow'],
            ['vehicle_id'=>9, 'driver_id'=>3,'trip_id'=>null,'liters'=>170,'cost_per_liter'=>1.39,'total_cost'=>236.30,'odometer_km'=>100000,'date'=>now()->subDays(50),'station'=>"Love's - Dallas"],
            ['vehicle_id'=>7, 'driver_id'=>5,'trip_id'=>null,'liters'=>55, 'cost_per_liter'=>1.51,'total_cost'=>83.05, 'odometer_km'=>28000,'date'=>now()->subDays(28),'station'=>'Chevron - Olympia'],
        ];
        foreach ($fuelData as $f) {
            $f['vehicle_id'] = $vehicles[$f['vehicle_id'] - 1]->id;
            $f['driver_id']  = $drivers[$f['driver_id'] - 1]->id;
            $f['trip_id']    = $f['trip_id'] ? $trips[$f['trip_id'] - 1]->id : null;
            FuelLog::create($f);
        }

        // ─── EXPENSE LOGS ────────────────────────────────────
        // model fields: date (not expense_date), description (not note)
        $expenseData = [
            ['category'=>'toll',       'vehicle_id'=>1, 'trip_id'=>1,  'amount'=>45.00,  'description'=>'Highway toll I-5 LA to SF',            'date'=>now()->subDays(20)],
            ['category'=>'toll',       'vehicle_id'=>3, 'trip_id'=>4,  'amount'=>62.50,  'description'=>'Florida Turnpike + I-75 tolls',          'date'=>now()->subDays(14)],
            ['category'=>'parking',    'vehicle_id'=>2, 'trip_id'=>2,  'amount'=>35.00,  'description'=>'Overnight secure parking - Boston',       'date'=>now()->subDays(17)],
            ['category'=>'parking',    'vehicle_id'=>2, 'trip_id'=>7,  'amount'=>28.00,  'description'=>'Downtown parking - Washington DC',        'date'=>now()->subDays(8)],
            ['category'=>'insurance',  'vehicle_id'=>1, 'trip_id'=>null,'amount'=>2400.00,'description'=>'Annual fleet insurance - Volvo FH16',   'date'=>now()->subDays(60)],
            ['category'=>'insurance',  'vehicle_id'=>2, 'trip_id'=>null,'amount'=>1800.00,'description'=>'Annual fleet insurance - Sprinter',      'date'=>now()->subDays(58)],
            ['category'=>'insurance',  'vehicle_id'=>5, 'trip_id'=>null,'amount'=>3200.00,'description'=>'Annual fleet insurance - Tesla Semi',    'date'=>now()->subDays(55)],
            ['category'=>'insurance',  'vehicle_id'=>6, 'trip_id'=>null,'amount'=>2600.00,'description'=>'Annual fleet insurance - Scania R500',   'date'=>now()->subDays(52)],
            ['category'=>'maintenance','vehicle_id'=>4, 'trip_id'=>null,'amount'=>1100.00,'description'=>'Brake and transmission repair costs',    'date'=>now()->subDays(2)],
            ['category'=>'maintenance','vehicle_id'=>12,'trip_id'=>null,'amount'=>2800.00,'description'=>'Emergency radiator repair - VW Crafter', 'date'=>now()->subDays(60)],
            ['category'=>'fuel',       'vehicle_id'=>1, 'trip_id'=>null,'amount'=>549.40, 'description'=>'Monthly fuel expense - Volvo FH16',      'date'=>now()->subDays(30)],
            ['category'=>'fuel',       'vehicle_id'=>6, 'trip_id'=>null,'amount'=>689.60, 'description'=>'Monthly fuel expense - Scania R500',     'date'=>now()->subDays(30)],
            ['category'=>'other',      'vehicle_id'=>null,'trip_id'=>null,'amount'=>890.00,'description'=>'Fleet GPS tracking subscription',       'date'=>now()->subDays(30)],
            ['category'=>'other',      'vehicle_id'=>null,'trip_id'=>null,'amount'=>450.00,'description'=>'Fleet management software license',     'date'=>now()->subDays(30)],
            ['category'=>'toll',       'vehicle_id'=>9, 'trip_id'=>6,  'amount'=>38.00,  'description'=>'Texas SH130 toll - Dallas to Houston',    'date'=>now()->subDays(10)],
            ['category'=>'parking',    'vehicle_id'=>8, 'trip_id'=>17, 'amount'=>22.00,  'description'=>'Truck stop parking - Pendleton, OR',      'date'=>now()->subHours(5)],
        ];
        foreach ($expenseData as $e) {
            $e['vehicle_id'] = $e['vehicle_id'] ? $vehicles[$e['vehicle_id'] - 1]->id : null;
            $e['trip_id']    = $e['trip_id']    ? $trips[$e['trip_id'] - 1]->id        : null;
            ExpenseLog::create($e);
        }

        // ─── DRIVER PERFORMANCE ──────────────────────────────
        $months = [now()->subMonths(2)->format('Y-m'), now()->subMonth()->format('Y-m'), now()->format('Y-m')];
        $perfData = [
            [[14,5200,920,0,4.7],[16,6100,1050,0,4.8],[12,4500,850,0,4.9]],
            [[10,3600,540,0,4.8],[11,4100,610,0,4.9],[8,2800,420,0,4.9]],
            [[18,6800,1200,1,4.4],[15,5800,1020,0,4.6],[15,5200,980,1,4.5]],
            [[8,2900,430,0,4.9],[9,3400,510,0,4.8],[7,2600,390,0,4.9]],
            [[13,4800,880,1,4.3],[14,5300,960,0,4.5],[10,3800,700,0,4.6]],
            [[6,2200,330,0,5.0],[7,2700,400,0,5.0],[6,2400,360,0,5.0]],
            [[16,6200,1100,0,4.6],[14,5400,950,1,4.4],[0,0,0,0,0]],
            [[4,1500,220,0,4.8],[5,1900,280,0,4.9],[5,1800,270,0,4.8]],
        ];
        foreach ($drivers as $di => $driver) {
            foreach ($months as $mi => $month) {
                $p = $perfData[$di][$mi];
                if ($p[0] == 0) continue;
                DriverPerformance::create([
                    'driver_id'        => $driver->id,
                    'period'           => $month,
                    'trips_completed'  => $p[0],
                    'distance_covered' => $p[1],
                    'fuel_consumed'    => $p[2],
                    'safety_incidents' => $p[3],
                    'rating'           => $p[4],
                ]);
            }
        }

        // ─── COMPLIANCE RECORDS ──────────────────────────────
        // status: 'pending','compliant','non_compliant','expired'
        $compData = [
            ['vehicle_id'=>1, 'driver_id'=>null,'type'=>'insurance',    'description'=>'Commercial vehicle insurance - comprehensive','due_date'=>'2026-12-31',           'status'=>'compliant'],
            ['vehicle_id'=>1, 'driver_id'=>null,'type'=>'registration',  'description'=>'Vehicle registration renewal',               'due_date'=>'2027-03-15',           'status'=>'compliant'],
            ['vehicle_id'=>2, 'driver_id'=>null,'type'=>'insurance',    'description'=>'Commercial vehicle insurance',               'due_date'=>'2026-08-20',           'status'=>'compliant'],
            ['vehicle_id'=>3, 'driver_id'=>null,'type'=>'emission',     'description'=>'Annual emission compliance test',            'due_date'=>now()->addDays(15)->toDateString(),'status'=>'pending'],
            ['vehicle_id'=>3, 'driver_id'=>null,'type'=>'insurance',    'description'=>'Vehicle insurance renewal',                  'due_date'=>'2026-06-30',           'status'=>'pending','notes'=>'Renewal quote requested'],
            ['vehicle_id'=>5, 'driver_id'=>null,'type'=>'registration',  'description'=>'EV registration and certification',          'due_date'=>'2027-09-01',           'status'=>'compliant'],
            ['vehicle_id'=>6, 'driver_id'=>null,'type'=>'insurance',    'description'=>'Heavy vehicle insurance',                    'due_date'=>'2026-10-15',           'status'=>'compliant'],
            ['vehicle_id'=>6, 'driver_id'=>null,'type'=>'safety_check', 'description'=>'DOT safety compliance inspection',           'due_date'=>now()->addDays(30)->toDateString(),'status'=>'pending'],
            ['vehicle_id'=>9, 'driver_id'=>null,'type'=>'insurance',    'description'=>'Commercial vehicle insurance',               'due_date'=>'2026-05-15',           'status'=>'pending','notes'=>'Expiring soon - urgent renewal'],
            ['vehicle_id'=>9, 'driver_id'=>null,'type'=>'emission',     'description'=>'Emission standards re-test',                 'due_date'=>now()->subDays(10)->toDateString(),'status'=>'expired','notes'=>'Failed initial test'],
            ['vehicle_id'=>12,'driver_id'=>null,'type'=>'insurance',    'description'=>'Vehicle insurance - retired unit',           'due_date'=>'2025-12-31',           'status'=>'expired'],
            ['vehicle_id'=>2, 'driver_id'=>2,   'type'=>'safety_check', 'description'=>'Driver safety certification renewal',        'due_date'=>now()->addDays(45)->toDateString(),'status'=>'pending'],
            ['vehicle_id'=>7, 'driver_id'=>5,   'type'=>'safety_check', 'description'=>'Hazmat handling certification',              'due_date'=>now()->addDays(60)->toDateString(),'status'=>'compliant'],
            ['vehicle_id'=>4, 'driver_id'=>null,'type'=>'registration',  'description'=>'Vehicle registration',                       'due_date'=>'2027-05-15',           'status'=>'compliant'],
            ['vehicle_id'=>8, 'driver_id'=>null,'type'=>'insurance',    'description'=>'Hybrid vehicle insurance',                   'due_date'=>'2027-08-31',           'status'=>'compliant'],
            ['vehicle_id'=>10,'driver_id'=>null,'type'=>'emission',     'description'=>'CNG vehicle emission certification',         'due_date'=>'2027-01-31',           'status'=>'compliant'],
            ['vehicle_id'=>11,'driver_id'=>null,'type'=>'registration',  'description'=>'New EV fleet registration',                  'due_date'=>'2028-03-15',           'status'=>'compliant'],
            ['vehicle_id'=>11,'driver_id'=>null,'type'=>'insurance',    'description'=>'New vehicle insurance policy',               'due_date'=>'2027-12-31',           'status'=>'compliant'],
        ];
        foreach ($compData as $c) {
            $c['vehicle_id'] = $vehicles[$c['vehicle_id'] - 1]->id;
            $c['driver_id']  = $c['driver_id'] ? $drivers[$c['driver_id'] - 1]->id : null;
            ComplianceRecord::create($c);
        }

        // ─── ANALYTICS CACHE ─────────────────────────────────
        AnalyticsCache::create([
            'key'  => 'fleet_performance',
            'data' => json_encode([
                'total_vehicles' => 12, 'active_vehicles' => 10,
                'total_drivers'  => 8,  'active_drivers'  => 7,
                'trips_this_month' => 18, 'revenue_this_month' => 28750.00,
                'expenses_this_month' => 15420.00, 'utilization_rate' => 78.5,
                'avg_safety_score' => 96.05, 'on_time_delivery' => 94.2,
                'monthly_revenue'  => [22400,26800,31200,28500,34100,28750],
                'monthly_expenses' => [14200,15800,17400,16900,18200,15420],
            ]),
            'computed_at' => now(),
        ]);

        $this->command->info('✅ Presentation data seeded successfully!');
        $this->command->info('🔑 Login: admin@fleetflow.com / password123');
    }
}

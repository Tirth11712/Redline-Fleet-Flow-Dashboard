<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\FuelLog;
use App\Models\ExpenseLog;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    use ApiResponse;

    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function vehiclesCsv()
    {
        $vehicles = Vehicle::all();
        $headers = ['ID', 'License Plate', 'Make', 'Model', 'Year', 'Type', 'Capacity (kg)', 'Odometer', 'Status', 'Fuel Type'];
        $rows = $vehicles->map(function ($v) {
            return [$v->id, $v->license_plate, $v->make, $v->model, $v->year, $v->type, $v->capacity_kg, $v->odometer, $v->status->value, $v->fuel_type];
        });
        return $this->exportCsv($headers, $rows, 'vehicles.csv');
    }

    public function tripsCsv(Request $request)
    {
        $query = Trip::with(['vehicle', 'driver.user']);
        if ($request->date_from) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->where('created_at', '<=', $request->date_to);
        }
        $trips = $query->get();
        $headers = ['ID', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Distance (km)', 'Cargo (kg)', 'Status', 'Cost', 'Revenue', 'Created'];
        $rows = $trips->map(function ($t) {
            return [$t->id, $t->vehicle->license_plate, $t->driver->user->name, $t->origin, $t->destination, $t->distance_km, $t->cargo_weight_kg, $t->status->value, $t->cost, $t->revenue, $t->created_at];
        });
        return $this->exportCsv($headers, $rows, 'trips.csv');
    }

    public function expensesCsv(Request $request)
    {
        $query = ExpenseLog::with('vehicle');
        if ($request->date_from) {
            $query->where('expense_date', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->where('expense_date', '<=', $request->date_to);
        }
        $expenses = $query->get();
        $headers = ['ID', 'Category', 'Vehicle', 'Amount', 'Description', 'Date'];
        $rows = $expenses->map(function ($e) {
            $plate = $e->vehicle ? $e->vehicle->license_plate : 'N/A';
            return [$e->id, $e->category, $plate, $e->amount, $e->description, $e->expense_date];
        });
        return $this->exportCsv($headers, $rows, 'expenses.csv');
    }

    public function fleetReportPdf(Request $request)
    {
        $period = $request->get('period', 'month');
        $performance = $this->analyticsService->getFleetPerformance($period);
        $financial = $this->analyticsService->getFinancialReport($period);
        $kpis = $this->analyticsService->getDashboardKpis();

        $pdf = Pdf::loadView('exports.fleet-report', compact('performance', 'financial', 'kpis'));
        return $pdf->download('fleet-report.pdf');
    }

    private function exportCsv(array $headers, $rows, string $filename)
    {
        $callback = function () use ($headers, $rows) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            foreach ($rows as $row) {
                fputcsv($file, is_array($row) ? $row : $row->toArray());
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}

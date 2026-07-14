<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FuelLog;
use App\Traits\ApiResponse;
use App\Http\Resources\FuelLogResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FuelLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = FuelLog::with(['vehicle', 'driver.user', 'trip']);

        if ($request->vehicle_id)
            $query->where('vehicle_id', $request->vehicle_id);
        if ($request->driver_id)
            $query->where('driver_id', $request->driver_id);
        if ($request->trip_id)
            $query->where('trip_id', $request->trip_id);
        if ($request->date_from)
            $query->where('date', '>=', $request->date_from);
        if ($request->date_to)
            $query->where('date', '<=', $request->date_to);

        $sortBy = $request->get('sort_by', 'date');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        return $this->paginated(FuelLogResource::collection($query->paginate($request->get('per_page', 15)))->resource, 'Fuel logs retrieved');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:drivers,id',
            'trip_id' => 'nullable|exists:trips,id',
            'liters' => 'required|numeric|min:0.01',
            'cost_per_liter' => 'required|numeric|min:0',
            'odometer_km' => 'required|numeric|min:0',
            'date' => 'required|date',
            'station' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();
        $data['total_cost'] = round($data['liters'] * $data['cost_per_liter'], 2);

        $log = FuelLog::create($data);
        return $this->success(new FuelLogResource($log->load(['vehicle', 'driver.user'])), 'Fuel log created', 201);
    }

    public function show(FuelLog $fuelLog)
    {
        $fuelLog->load(['vehicle', 'driver.user', 'trip']);
        return $this->success(new FuelLogResource($fuelLog), 'Fuel log retrieved');
    }

    public function update(Request $request, FuelLog $fuelLog)
    {
        $validator = Validator::make($request->all(), [
            'liters' => 'sometimes|numeric|min:0.01',
            'cost_per_liter' => 'sometimes|numeric|min:0',
            'odometer_km' => 'sometimes|numeric|min:0',
            'date' => 'sometimes|date',
            'station' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $data = $validator->validated();
        if (isset($data['liters']) || isset($data['cost_per_liter'])) {
            $liters = $data['liters'] ?? $fuelLog->liters;
            $costPerLiter = $data['cost_per_liter'] ?? $fuelLog->cost_per_liter;
            $data['total_cost'] = round($liters * $costPerLiter, 2);
        }

        $fuelLog->update($data);
        return $this->success(new FuelLogResource($fuelLog->fresh()), 'Fuel log updated');
    }

    public function destroy(FuelLog $fuelLog)
    {
        $fuelLog->delete();
        return $this->success(null, 'Fuel log deleted');
    }
}

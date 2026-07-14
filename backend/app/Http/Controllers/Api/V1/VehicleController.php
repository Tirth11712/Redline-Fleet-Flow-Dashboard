<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\VehicleService;
use App\Models\Vehicle;
use App\Traits\ApiResponse;
use App\Http\Resources\VehicleResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller
{
    use ApiResponse;

    protected VehicleService $vehicleService;

    public function __construct(VehicleService $vehicleService)
    {
        $this->vehicleService = $vehicleService;
    }

    public function index(Request $request)
    {
        $vehicles = $this->vehicleService->list(
            $request->only(['status', 'type', 'fuel_type', 'search', 'sort_by', 'sort_dir']),
            $request->get('per_page', 15)
        );
        return $this->paginated(VehicleResource::collection($vehicles)->resource, 'Vehicles retrieved');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'license_plate' => 'required|string|unique:vehicles,license_plate',
            'make' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'type' => 'required|in:truck,van,car,bus,motorcycle,trailer',
            'capacity_kg' => 'required|numeric|min:0',
            'fuel_type' => 'required|in:diesel,petrol,electric,hybrid,cng',
            'odometer' => 'nullable|numeric|min:0',
            'vin' => 'nullable|string|max:50',
            'insurance_expiry' => 'nullable|date',
            'registration_expiry' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $validated = $validator->validated();
        $validated['type'] = ucfirst($validated['type']);
        $vehicle = $this->vehicleService->create($validated);
        return $this->success(new VehicleResource($vehicle), 'Vehicle created', 201);
    }

    public function show(Vehicle $vehicle)
    {
        $vehicle->load(['trips', 'maintenanceLogs', 'fuelLogs']);
        return $this->success(new VehicleResource($vehicle), 'Vehicle retrieved');
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validator = Validator::make($request->all(), [
            'license_plate' => 'sometimes|string|unique:vehicles,license_plate,' . $vehicle->id,
            'make' => 'sometimes|string|max:100',
            'model' => 'sometimes|string|max:100',
            'year' => 'sometimes|integer|min:1990|max:' . (date('Y') + 1),
            'type' => 'sometimes|in:truck,van,car,bus,motorcycle,trailer',
            'capacity_kg' => 'sometimes|numeric|min:0',
            'fuel_type' => 'sometimes|in:diesel,petrol,electric,hybrid,cng',
            'odometer' => 'sometimes|numeric|min:0',
            'vin' => 'nullable|string|max:50',
            'insurance_expiry' => 'nullable|date',
            'registration_expiry' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $validated = $validator->validated();
        if (isset($validated['type'])) {
            $validated['type'] = ucfirst($validated['type']);
        }
        $vehicle = $this->vehicleService->update($vehicle, $validated);
        return $this->success(new VehicleResource($vehicle), 'Vehicle updated');
    }

    public function destroy(Vehicle $vehicle)
    {
        $this->vehicleService->delete($vehicle);
        return $this->success(null, 'Vehicle deleted');
    }

    public function roi(Vehicle $vehicle)
    {
        $roi = $this->vehicleService->calculateROI($vehicle);
        return $this->success($roi, 'Vehicle ROI calculated');
    }
}

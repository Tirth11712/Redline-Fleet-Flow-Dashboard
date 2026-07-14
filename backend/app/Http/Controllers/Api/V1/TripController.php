<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TripService;
use App\Models\Trip;
use App\Enums\TripStatus;
use App\Traits\ApiResponse;
use App\Http\Resources\TripResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TripController extends Controller
{
    use ApiResponse;

    protected TripService $tripService;

    public function __construct(TripService $tripService)
    {
        $this->tripService = $tripService;
    }

    public function index(Request $request)
    {
        $trips = $this->tripService->list(
            $request->only(['status', 'vehicle_id', 'driver_id', 'date_from', 'date_to', 'search', 'sort_by', 'sort_dir']),
            $request->get('per_page', 15)
        );
        return $this->paginated(TripResource::collection($trips)->resource, 'Trips retrieved');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:drivers,id',
            'origin' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'distance_km' => 'nullable|numeric|min:0',
            'cargo_kg' => 'nullable|numeric|min:0',
            'cargo_description' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'revenue' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        try {
            $trip = $this->tripService->create($validator->validated());
            return $this->success(new TripResource($trip->load(['vehicle', 'driver.user'])), 'Trip created', 201);
        }
        catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Business rule violation', 422, $e->errors());
        }
    }

    public function show(Trip $trip)
    {
        $trip->load(['vehicle', 'driver.user', 'fuelLogs', 'expenseLogs']);
        return $this->success(new TripResource($trip), 'Trip retrieved');
    }

    public function update(Request $request, Trip $trip)
    {
        $validator = Validator::make($request->all(), [
            'origin' => 'sometimes|string|max:255',
            'destination' => 'sometimes|string|max:255',
            'distance_km' => 'sometimes|numeric|min:0',
            'cargo_kg' => 'sometimes|numeric|min:0',
            'cargo_description' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'revenue' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        try {
            $trip = $this->tripService->update($trip, $validator->validated());
            return $this->success(new TripResource($trip), 'Trip updated');
        }
        catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Business rule violation', 422, $e->errors());
        }
    }

    public function updateStatus(Request $request, Trip $trip)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Draft,Dispatched,Completed,Cancelled',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        try {
            $newStatus = TripStatus::from($request->status);
            $trip = $this->tripService->updateStatus($trip, $newStatus);
            return $this->success(new TripResource($trip), 'Trip status updated');
        }
        catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Status transition not allowed', 422, $e->errors());
        }
    }

    public function destroy(Trip $trip)
    {
        try {
            $this->tripService->delete($trip);
            return $this->success(null, 'Trip deleted');
        }
        catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Cannot delete trip', 422, $e->errors());
        }
    }

    public function costBreakdown(Trip $trip)
    {
        $breakdown = $this->tripService->getCostBreakdown($trip);
        return $this->success($breakdown, 'Trip cost breakdown');
    }
}

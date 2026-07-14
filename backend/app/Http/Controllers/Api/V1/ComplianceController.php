<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRecord;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ComplianceController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = ComplianceRecord::with(['vehicle', 'driver.user']);

        if ($request->vehicle_id)
            $query->where('vehicle_id', $request->vehicle_id);
        if ($request->driver_id)
            $query->where('driver_id', $request->driver_id);
        if ($request->status)
            $query->where('status', $request->status);
        if ($request->type)
            $query->where('type', $request->type);
        if ($request->expiring_soon)
            $query->expiringSoon((int)$request->get('days', 30));

        $sortBy = $request->get('sort_by', 'due_date');
        $sortDir = $request->get('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        return $this->paginated($query->paginate($request->get('per_page', 15)), 'Compliance records retrieved');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'nullable|exists:drivers,id',
            'type' => 'required|string|max:100',
            'description' => 'required|string|max:255',
            'due_date' => 'required|date',
            'status' => 'nullable|in:pending,compliant,non_compliant,expired',
            'document_path' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $record = ComplianceRecord::create($validator->validated());
        return $this->success($record->load(['vehicle', 'driver.user']), 'Compliance record created', 201);
    }

    public function show(ComplianceRecord $compliance)
    {
        $compliance->load(['vehicle', 'driver.user']);
        return $this->success($compliance, 'Compliance record retrieved');
    }

    public function update(Request $request, ComplianceRecord $compliance)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|string|max:100',
            'description' => 'sometimes|string|max:255',
            'due_date' => 'sometimes|date',
            'status' => 'sometimes|in:pending,compliant,non_compliant,expired',
            'document_path' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $compliance->update($validator->validated());
        return $this->success($compliance->fresh(), 'Compliance record updated');
    }

    public function destroy(ComplianceRecord $compliance)
    {
        $compliance->delete();
        return $this->success(null, 'Compliance record deleted');
    }
}

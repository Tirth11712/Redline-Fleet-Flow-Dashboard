<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExpenseLog;
use App\Traits\ApiResponse;
use App\Http\Resources\ExpenseLogResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpenseController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = ExpenseLog::with(['vehicle', 'trip']);

        if ($request->category)
            $query->where('category', $request->category);
        if ($request->vehicle_id)
            $query->where('vehicle_id', $request->vehicle_id);
        if ($request->date_from)
            $query->where('date', '>=', $request->date_from);
        if ($request->date_to)
            $query->where('date', '<=', $request->date_to);
        if ($request->search)
            $query->where('description', 'like', "%{$request->search}%");

        $sortBy = $request->get('sort_by', 'date');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        return $this->paginated(ExpenseLogResource::collection($query->paginate($request->get('per_page', 15)))->resource, 'Expenses retrieved');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|in:Fuel,Toll,Insurance,Repair,Permit',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'trip_id' => 'nullable|exists:trips,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string|max:255',
            'receipt_path' => 'nullable|string',
            'date' => 'required|date',
            'note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $expense = ExpenseLog::create($validator->validated());
        return $this->success(new ExpenseLogResource($expense), 'Expense recorded', 201);
    }

    public function show(ExpenseLog $expense)
    {
        $expense->load(['vehicle', 'trip']);
        return $this->success(new ExpenseLogResource($expense), 'Expense retrieved');
    }

    public function update(Request $request, ExpenseLog $expense)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'sometimes|in:Fuel,Toll,Insurance,Repair,Permit',
            'amount' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|string|max:255',
            'receipt_path' => 'nullable|string',
            'date' => 'sometimes|date',
            'note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->error('Validation failed', 422, $validator->errors());
        }

        $expense->update($validator->validated());
        return $this->success(new ExpenseLogResource($expense->fresh()), 'Expense updated');
    }

    public function destroy(ExpenseLog $expense)
    {
        $expense->delete();
        return $this->success(null, 'Expense deleted');
    }
}

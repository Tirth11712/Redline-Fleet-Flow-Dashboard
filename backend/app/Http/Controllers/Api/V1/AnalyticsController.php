<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    use ApiResponse;

    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function fleetPerformance(Request $request)
    {
        $period = $request->get('period', 'month');
        $data = $this->analyticsService->getFleetPerformance($period);
        return $this->success($data, 'Fleet performance retrieved');
    }

    public function financialReport(Request $request)
    {
        $period = $request->get('period', 'month');
        $data = $this->analyticsService->getFinancialReport($period);
        return $this->success($data, 'Financial report retrieved');
    }

    public function driverRankings(Request $request)
    {
        $limit = $request->get('limit', 10);
        $data = $this->analyticsService->getDriverRankings($limit);
        return $this->success($data, 'Driver rankings retrieved');
    }

    public function charts(Request $request)
    {
        $months = $request->get('months', 6);
        $data = $this->analyticsService->getChartData($months);
        return $this->success($data, 'Chart data retrieved');
    }
}

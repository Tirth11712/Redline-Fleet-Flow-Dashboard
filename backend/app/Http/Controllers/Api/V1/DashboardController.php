<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Traits\ApiResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function kpis()
    {
        $kpis = $this->analyticsService->getDashboardKpis();
        return $this->success($kpis, 'Dashboard KPIs retrieved');
    }
}

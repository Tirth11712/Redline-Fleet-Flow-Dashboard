<?php

namespace App\Jobs;

use App\Services\AnalyticsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ComputeAnalyticsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct()
    {
    //
    }

    public function handle(AnalyticsService $analyticsService): void
    {
        Log::info('ComputeAnalyticsJob: Starting analytics computation');

        try {
            // Refresh dashboard KPIs cache
            $analyticsService->getDashboardKpis();

            // Pre-compute common periods
            foreach (['week', 'month', 'quarter', 'year'] as $period) {
                $analyticsService->getFleetPerformance($period);
                $analyticsService->getFinancialReport($period);
            }

            $analyticsService->getDriverRankings(20);

            Log::info('ComputeAnalyticsJob: Analytics computation completed successfully');
        }
        catch (\Exception $e) {
            Log::error('ComputeAnalyticsJob failed: ' . $e->getMessage());
            throw $e;
        }
    }
}

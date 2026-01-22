<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportingController extends Controller
{
    protected $reportingService;

    public function __construct(ReportingService $reportingService)
    {
        $this->reportingService = $reportingService;
    }

    /**
     * GET /api/v1/reporting/performance
     */
    public function performance(): JsonResponse
    {
        $stats = $this->reportingService->getPerformanceStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }

    /**
     * GET /api/v1/reporting/reports
     */
    public function reports(): JsonResponse
    {
        $reports = $this->reportingService->getReportsList();

        return response()->json([
            'success' => true,
            'data' => $reports
        ], 200);
    }

    /**
     * POST /api/v1/reporting/reports
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'test_id' => 'required|uuid|exists:tests_industriels,id_test',
            'type_rapport' => 'required|string',
            'date_edition' => 'required|date',
            'resume_executif' => 'nullable|string',
            'redacteur_id' => 'required|uuid|exists:personnels,id_personnel',
        ]);

        $report = $this->reportingService->createReport($validated);

        return response()->json([
            'success' => true,
            'message' => 'Rapport généré avec succès',
            'data' => $report
        ], 201);
    }
}

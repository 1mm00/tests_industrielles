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

    /**
     * POST /api/v1/reporting/custom-query
     */
    public function customQuery(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'metric' => 'required|string|in:tests_count,nc_count,conformity_rate',
            'dimension' => 'required|string|in:date_test,type_test,equipement,criticite',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $results = $this->reportingService->customQuery($validated);

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }

    /**
     * GET /api/v1/reporting/favorites
     */
    public function getFavorites(Request $request): JsonResponse
    {
        $favorites = $this->reportingService->getUserFavorites($request->user()->id_personnel);

        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }

    /**
     * POST /api/v1/reporting/favorites
     */
    public function saveFavorite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'config' => 'required|array'
        ]);

        $validated['user_id'] = $request->user()->id_personnel;

        $favorite = $this->reportingService->saveFavorite($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vue ajoutée aux favoris',
            'data' => $favorite
        ], 201);
    }

    /**
     * DELETE /api/v1/reporting/favorites/{id}
     */
    public function deleteFavorite(Request $request, string $id): JsonResponse
    {
        $this->reportingService->deleteFavorite($id, $request->user()->id_personnel);

        return response()->json([
            'success' => true,
            'message' => 'Favori supprimé'
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\NonConformiteService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NonConformiteController extends Controller
{
    protected $ncService;

    public function __construct(NonConformiteService $ncService)
    {
        $this->ncService = $ncService;
    }

    /**
     * GET /api/v1/non-conformites
     */
    public function index(Request $request): JsonResponse
    {
        $paginator = $this->ncService->getPaginatedNc($request->all());

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
            ]
        ], 200);
    }

    /**
     * GET /api/v1/non-conformites/stats
     */
    public function stats(): JsonResponse
    {
        $stats = $this->ncService->getNcStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }

    /**
     * POST /api/v1/non-conformites
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'test_id' => 'nullable',
            'equipement_id' => 'required|uuid',
            'criticite_id' => 'required|uuid',
            'type_nc' => 'required|string',
            'description' => 'required|string',
            'impact_potentiel' => 'nullable|string',
            'date_detection' => 'required|date',
            'detecteur_id' => 'nullable',
        ]);

        $nc = $this->ncService->creerNc($validated);

        return response()->json([
            'success' => true,
            'message' => 'Non-conformité déclarée avec succès',
            'data' => $nc
        ], 201);
    }

    /**
     * GET /api/v1/non-conformites/creation-data
     */
    public function creationData(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->ncService->getCreationData()
        ]);
    }
}

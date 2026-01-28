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
        $paginator = $this->ncService->getPaginatedNc($request->all(), $request->user());

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
            'co_detecteurs' => 'nullable|array',
            'co_detecteurs.*' => 'uuid',
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

    /**
     * GET /api/v1/non-conformites/{id}
     */
    public function show(string $id): JsonResponse
    {
        $nc = \App\Models\NonConformite::with(['test', 'equipement', 'criticite'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $nc
        ]);
    }

    /**
     * PUT/PATCH /api/v1/non-conformites/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'test_id' => 'nullable',
            'equipement_id' => 'sometimes|required|uuid',
            'criticite_id' => 'sometimes|required|uuid',
            'type_nc' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'impact_potentiel' => 'nullable|string',
            'date_detection' => 'sometimes|required|date',
            'statut' => 'sometimes|required|string|in:OUVERTE,TRAITEMENT,RESOLUE,CLOTUREE',
            'conclusions' => 'nullable|string',
            'actions_correctives' => 'nullable|string',
            'cloturee_par_id' => 'nullable|uuid',
            'date_cloture' => 'nullable|date',
        ]);

        $nc = $this->ncService->updateNc($id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Non-conformité mise à jour avec succès',
            'data' => $nc
        ]);
    }

    /**
     * DELETE /api/v1/non-conformites/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $this->ncService->deleteNc($id);

        return response()->json([
            'success' => true,
            'message' => 'Non-conformité supprimée avec succès'
        ]);
    }
}

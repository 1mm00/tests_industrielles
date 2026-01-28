<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\EquipementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EquipementController extends Controller
{
    protected $equipementService;

    public function __construct(EquipementService $equipementService)
    {
        $this->equipementService = $equipementService;
    }

    /**
     * GET /api/v1/equipements
     */
    public function index(Request $request): JsonResponse
    {
        $paginator = $this->equipementService->getPaginatedEquipements($request->all());

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
     * GET /api/v1/equipements/stats
     */
    public function stats(): JsonResponse
    {
        $stats = $this->equipementService->getEquipementStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }

    /**
     * GET /api/v1/equipements/{id}
     */
    public function show(string $id): JsonResponse
    {
        $equipement = \App\Models\Equipement::find($id);

        if (!$equipement) {
            return response()->json(['message' => 'Équipement non trouvé'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $equipement
        ], 200);
    }

    /**
     * POST /api/v1/equipements
     */
    public function store(Request $request): JsonResponse
    {
        $equipement = $this->equipementService->createEquipement($request->all());

        return response()->json([
            'success' => true,
            'data' => $equipement
        ], 201);
    }

    /**
     * DELETE /api/v1/equipements/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $equipement = \App\Models\Equipement::find($id);
        
        if (!$equipement) {
            return response()->json(['message' => 'Équipement non trouvé'], 404);
        }
        
        $equipement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Équipement supprimé avec succès'
        ], 200);
    }
}

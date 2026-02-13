<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\MesureService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MesureController extends Controller
{
    protected $mesureService;

    public function __construct(MesureService $mesureService)
    {
        $this->mesureService = $mesureService;
    }

    /**
     * GET /api/v1/tests/{test_id}/mesures
     */
    public function index(string $testId): JsonResponse
    {
        $mesures = $this->mesureService->getMesuresParTest($testId);
        
        return response()->json([
            'success' => true,
            'data' => $mesures
        ], 200);
    }

    /**
     * POST /api/v1/tests/{test_id}/mesures
     */
    public function store(Request $request, string $testId): JsonResponse
    {
        $validated = $request->validate([
            'item_id' => 'nullable|uuid',
            'criticite' => 'nullable|integer',
            'instrument_id' => 'nullable|uuid',
            'type_mesure' => 'required|string',
            'parametre_mesure' => 'required|string',
            'valeur_mesuree' => 'required|numeric',
            'unite_mesure' => 'required|string',
            'valeur_reference' => 'nullable|numeric',
            'tolerance_min' => 'nullable|numeric',
            'tolerance_max' => 'nullable|numeric',
            'conditions_mesure' => 'nullable|string',
            'incertitude_mesure' => 'nullable|string',
            'timestamp_mesure' => 'nullable|date',
            'conforme' => 'nullable|boolean',
            'operateur_id' => 'nullable|uuid',
        ]);

        $validated['test_id'] = $testId;
        if (!isset($validated['operateur_id']) && $request->user()->id_personnel) {
            $validated['operateur_id'] = $request->user()->id_personnel;
        }

        $mesure = $this->mesureService->ajouterMesure($validated);

        return response()->json([
            'success' => true,
            'message' => 'Mesure enregistrée avec succès',
            'data' => $mesure
        ], 201);
    }

    /**
     * PUT /api/v1/mesures/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'valeur_mesuree' => 'nullable|numeric',
            'valeur_reference' => 'nullable|numeric',
            'tolerance_min' => 'nullable|numeric',
            'tolerance_max' => 'nullable|numeric',
            'conditions_mesure' => 'nullable|string',
        ]);

        $mesure = $this->mesureService->updateMesure($id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Mesure mise à jour',
            'data' => $mesure
        ], 200);
    }

    /**
     * DELETE /api/v1/mesures/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $this->mesureService->supprimerMesure($id);

        return response()->json([
            'success' => true,
            'message' => 'Mesure supprimée'
        ], 200);
    }
}

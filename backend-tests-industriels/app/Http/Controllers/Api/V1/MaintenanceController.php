<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\MaintenanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MaintenanceController extends Controller
{
    protected $maintenanceService;

    public function __construct(MaintenanceService $maintenanceService)
    {
        $this->maintenanceService = $maintenanceService;
    }

    /**
     * GET /api/v1/maintenances
     */
    public function index(Request $request): JsonResponse
    {
        $paginator = $this->maintenanceService->getPaginatedMaintenances($request->all());

        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'meta' => [
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
            ]
        ]);
    }

    /**
     * GET /api/v1/maintenances/stats
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->maintenanceService->getStats()
        ]);
    }

    /**
     * POST /api/v1/maintenances (Planification)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'equipement_id' => 'required|uuid|exists:equipements,id_equipement',
            'titre' => 'required|string|max:200',
            'description' => 'nullable|string',
            'type' => 'required|in:PREVENTIVE,CURATIVE,CALIBRATION',
            'priorite' => 'required|in:BASSE,MOYENNE,HAUTE,CRITIQUE',
            'date_prevue' => 'required|date',
            'periodicite_jours' => 'nullable|integer',
            'cout_estime' => 'nullable|numeric',
        ]);

        $maintenance = $this->maintenanceService->planifierMaintenance($validated);

        return response()->json([
            'success' => true,
            'message' => 'Intervention planifiée avec succès',
            'data' => $maintenance
        ], 201);
    }

    /**
     * POST /api/v1/maintenances/{id}/terminer
     */
    public function terminer(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'date_realisation' => 'required|date',
            'rapport_technique' => 'required|string',
            'cout_reel' => 'nullable|numeric',
            'technicien_id' => 'required|uuid|exists:personnels,id_personnel',
            'pieces_changees' => 'nullable|array',
        ]);

        $maintenance = $this->maintenanceService->terminerMaintenance($id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Intervention enregistrée et clôturée',
            'data' => $maintenance
        ]);
    }

    /**
     * GET /api/v1/maintenances/{id}
     */
    public function show(string $id): JsonResponse
    {
        $maintenance = \App\Models\Maintenance::with(['equipement', 'technicien'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $maintenance
        ]);
    }
}

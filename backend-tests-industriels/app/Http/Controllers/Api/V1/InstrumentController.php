<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\InstrumentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InstrumentController extends Controller
{
    protected $instrumentService;

    public function __construct(InstrumentService $instrumentService)
    {
        $this->instrumentService = $instrumentService;
    }

    /**
     * GET /api/v1/instruments
     */
    public function index(Request $request): JsonResponse
    {
        $paginator = $this->instrumentService->getPaginatedInstruments($request->all());

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
     * GET /api/v1/instruments/stats
     */
    public function stats(): JsonResponse
    {
        $stats = $this->instrumentService->getInstrumentStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }

    /**
     * GET /api/v1/instruments/alerts
     */
    public function alerts(): JsonResponse
    {
        $alerts = $this->instrumentService->getCalibrationAlertsDetailed();

        return response()->json([
            'success' => true,
            'data' => $alerts
        ], 200);
    }

    /**
     * GET /api/v1/instruments/{id}
     */
    public function show(string $id): JsonResponse
    {
        $instrument = \App\Models\InstrumentMesure::with(['calibrations', 'mesures'])->find($id);

        if (!$instrument) {
            return response()->json(['message' => 'Instrument non trouvé'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $instrument
        ], 200);
    }

    /**
     * POST /api/v1/instruments
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code_instrument' => 'required|string|max:50|unique:instruments_mesure,code_instrument',
            'designation' => 'required|string|max:200',
            'type_instrument' => 'required|string|max:100',
            'categorie_mesure' => 'required|string',
            'unite_mesure' => 'required|string|max:50',
            'periodicite_calibration_mois' => 'required|integer|min:1',
            'statut' => 'required|string',
        ]);

        $instrument = $this->instrumentService->createInstrument($request->all());

        return response()->json([
            'success' => true,
            'data' => $instrument
        ], 201);
    }

    /**
     * DELETE /api/v1/instruments/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $instrument = \App\Models\InstrumentMesure::find($id);
        
        if (!$instrument) {
            return response()->json(['message' => 'Instrument non trouvé'], 404);
        }
        
        $instrument->delete();

        return response()->json([
            'success' => true,
            'message' => 'Instrument supprimé avec succès'
        ], 200);
    }
}

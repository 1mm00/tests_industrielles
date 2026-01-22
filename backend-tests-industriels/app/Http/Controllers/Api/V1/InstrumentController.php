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
}

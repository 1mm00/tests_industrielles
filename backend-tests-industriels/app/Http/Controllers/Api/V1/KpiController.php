<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\KpiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KpiController extends Controller
{
    protected KpiService $kpiService;

    public function __construct(KpiService $kpiService)
    {
        $this->kpiService = $kpiService;
    }

    /**
     * Récupérer les KPIs du dashboard
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['start_date', 'end_date', 'type_test_id', 'equipement_id']);
            
            $kpis = $this->kpiService->getDashboardKpis($filters);

            return response()->json([
                'success' => true,
                'data' => $kpis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des KPIs',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Récupérer l'évolution des KPIs dans le temps
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function evolution(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['start_date', 'end_date']);
            
            $evolution = $this->kpiService->getTendances(
                $filters['start_date'] ?? now()->subMonths(6),
                $filters['end_date'] ?? now()
            );

            return response()->json([
                'success' => true,
                'data' => $evolution,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'évolution',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * KPIs par type de test
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function byTypeTest(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['start_date', 'end_date']);
            
            $kpis = $this->kpiService->getPerformanceParType(
                $filters['start_date'] ?? now()->subMonth(),
                $filters['end_date'] ?? now()
            );

            return response()->json([
                'success' => true,
                'data' => $kpis,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des KPIs par type',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Taux de réussite global
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function tauxReussite(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['start_date', 'end_date']);
            
            $taux = $this->kpiService->calculateTauxReussite(
                $filters['start_date'] ?? now()->subMonth(),
                $filters['end_date'] ?? now()
            );

            return response()->json([
                'success' => true,
                'data' => $taux,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul du taux de réussite',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

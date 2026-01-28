<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TestIndustrielService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestIndustrielController extends Controller
{
    protected $testService;

    public function __construct(TestIndustrielService $testService)
    {
        $this->testService = $testService;
    }

    /**
     * GET /api/v1/tests
     */
    public function index(Request $request): JsonResponse
    {
        $paginator = $this->testService->getPaginatedTests($request->all(), $request->user());
        
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
     * POST /api/v1/tests
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type_test_id' => 'required|uuid',
            'equipement_id' => 'required|uuid',
            'phase_id' => 'nullable|uuid',
            'procedure_id' => 'nullable|uuid',
            'responsable_test_id' => 'nullable|uuid',
            'date_test' => 'required|date',
            'heure_debut' => 'nullable|string',
            'heure_fin' => 'nullable|string',
            'localisation' => 'required|string',
            'niveau_criticite' => 'required|integer|between:1,4',
            'arret_production_requis' => 'nullable|boolean',
            'observations_generales' => 'nullable|string',
            'equipe_test' => 'nullable|array',
            'equipe_test.*' => 'uuid',
        ]);

        $test = $this->testService->creerTest($validated);


        return response()->json([
            'success' => true,
            'message' => 'Test créé avec succès',
            'data' => $test
        ], 201);
    }

    /**
     * GET /api/v1/tests/{id}
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Version ultra-simplifiée pour diagnostic
            $test = TestIndustriel::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id_test' => $test->id_test,
                    'numero_test' => $test->numero_test,
                    'statut_test' => $test->statut_test->value ?? 'INCONNU',
                    'date_test' => $test->date_test,
                    'localisation' => $test->localisation,
                    'niveau_criticite' => $test->niveau_criticite,
                ]
            ], 200);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching test: ' . $e->getMessage(), [
                'test_id' => $id,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT/PATCH /api/v1/tests/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // Logique de mise à jour
        return response()->json([
            'success' => true,
            'message' => 'Test mis à jour'
        ], 200);
    }

    /**
     * DELETE /api/v1/tests/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->testService->deleteTest($id);
            return response()->json([
                'success' => true,
                'message' => 'Test supprimé avec succès de la base de données'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Test non trouvé'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/tests/{id}/demarrer
     */
    public function demarrer(string $id): JsonResponse
    {
        try {
            $test = $this->testService->demarrerTest($id);

            return response()->json([
                'success' => true,
                'message' => 'Test démarré avec succès',
                'data' => $test
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * POST /api/v1/tests/{id}/terminer
     */
    public function terminer(string $id): JsonResponse
    {
        try {
            $test = $this->testService->terminerTest($id);

            return response()->json([
                'success' => true,
                'message' => 'Test terminé avec succès',
                'data' => $test
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * GET /api/v1/tests/stats
     */
    public function stats(): JsonResponse
    {
        $stats = $this->testService->getGlobalStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }

    /**
     * GET /api/v1/tests/technician-stats
     */
    public function technicianStats(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->id_personnel) {
            return response()->json(['success' => false, 'message' => 'Utilisateur sans personnel associé'], 400);
        }

        $stats = $this->testService->getTechnicianStats($user->id_personnel);

        return response()->json([
            'success' => true,
            'data' => $stats
        ], 200);
    }

    /**
     * GET /api/v1/tests/creation-data
     */
    public function creationData(): JsonResponse
    {
        $data = $this->testService->getCreationData();

        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }

    /**
     * GET /api/v1/tests/calendar
     */
    public function calendar(Request $request): JsonResponse
    {
        $month = $request->query('month');
        $year = $request->query('year');
        
        $tests = $this->testService->getCalendarTests($month, $year);

        return response()->json([
            'success' => true,
            'data' => $tests
        ], 200);
    }
}

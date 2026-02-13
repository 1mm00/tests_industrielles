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
        $nc = \App\Models\NonConformite::with([
            'test', 
            'equipement', 
            'criticite', 
            'causesRacines', 
            'planAction.actions.responsable',
            'planAction.responsable',
            'detecteur'
        ])->findOrFail($id);
        
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

        $nc = \App\Models\NonConformite::findOrFail($id);
        $this->authorize('update', $nc);

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
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $this->ncService->deleteNc($id, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Non-conformité supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * POST /api/v1/non-conformites/{id}/archive
     */
    public function archive(string $id): JsonResponse
    {
        try {
            $nc = $this->ncService->archiveNc($id);
            return response()->json([
                'success' => true,
                'message' => $nc->is_archived ? 'NC archivée avec succès' : 'NC désarchivée avec succès',
                'data' => $nc
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'archivage : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/v1/non-conformites/{id}/analyser
     */
    public function analyser(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'causes_racines' => 'required|array',
            'causes_racines.*.categorie' => 'required|string',
            'causes_racines.*.description' => 'required|string',
            'causes_racines.*.probabilite' => 'required|string',
            'conclusions' => 'nullable|string',
        ]);

        $nc = \App\Models\NonConformite::findOrFail($id);
        $this->authorize('analyze', $nc);

        $nc = $this->ncService->analyserNc($id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Analyse enregistrée avec succès',
            'data' => $nc
        ]);
    }

    /**
     * POST /api/v1/non-conformites/{id}/plan-action
     */
    public function createPlanAction(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'responsable_id' => 'required|uuid',
            'date_echeance' => 'required|date',
            'objectifs' => 'nullable|string',
            'actions' => 'required|array',
            'actions.*.type_action' => 'required|string',
            'actions.*.description' => 'required|string',
            'actions.*.responsable_id' => 'required|uuid',
            'actions.*.date_prevue' => 'required|date',
        ]);

        $nc = \App\Models\NonConformite::findOrFail($id);
        $this->authorize('update', $nc);

        $plan = $this->ncService->createPlanAction($id, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Plan d\'action créé avec succès',
            'data' => $plan
        ]);
    }

    /**
     * POST /api/v1/non-conformites/{id}/cloturer
     */
    public function cloturer(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'commentaires_cloture' => 'required|string|min:20',
        ]);

        try {
            $nc = $this->ncService->cloturerNc($id, $validated, $request->user()->id_personnel);

            return response()->json([
                'success' => true,
                'message' => 'Non-conformité clôturée officiellement avec succès',
                'data' => $nc
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * POST /api/v1/non-conformites/{id}/reouvrir
     */
    public function reouvrir(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'motif_reouverture' => 'required|string|min:20',
        ]);

        try {
            $nc = $this->ncService->reouvrirNc($id, $validated, $request->user()->id_personnel);

            return response()->json([
                'success' => true,
                'message' => 'Non-conformité réouverte avec succès',
                'data' => $nc
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}

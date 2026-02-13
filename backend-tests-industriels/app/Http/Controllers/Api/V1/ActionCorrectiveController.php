<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActionCorrective;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ActionCorrectiveController extends Controller
{
    /**
     * Mettre à jour le statut d'une action corrective
     * PUT /api/v1/actions-correctives/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'statut' => 'required|string|in:PLANIFIEE,EN_COURS,REALISEE,ANNULEE',
            'date_realisee' => 'nullable|date',
            'commentaires' => 'nullable|string',
        ]);

        $action = ActionCorrective::findOrFail($id);

        // Si on marque comme réalisée, on enregistre la date automatiquement
        if ($validated['statut'] === 'REALISEE' && !isset($validated['date_realisee'])) {
            $validated['date_realisee'] = now();
        }

        $action->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Action corrective mise à jour avec succès',
            'data' => $action->fresh(['responsable'])
        ]);
    }

    /**
     * Récupérer toutes les actions d'un plan d'action
     * GET /api/v1/plan-actions/{planId}/actions
     */
    public function getByPlan(string $planId): JsonResponse
    {
        $actions = ActionCorrective::where('plan_id', $planId)
            ->with('responsable')
            ->orderBy('date_prevue')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $actions
        ]);
    }

    /**
     * Marquer plusieurs actions comme réalisées en masse
     * POST /api/v1/actions-correctives/bulk-complete
     */
    public function bulkComplete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action_ids' => 'required|array',
            'action_ids.*' => 'uuid|exists:action_correctives,id_action',
        ]);

        $count = ActionCorrective::whereIn('id_action', $validated['action_ids'])
            ->update([
                'statut' => 'REALISEE',
                'date_realisee' => now()
            ]);

        return response()->json([
            'success' => true,
            'message' => "{$count} action(s) marquée(s) comme réalisée(s)",
            'data' => ['updated_count' => $count]
        ]);
    }
}

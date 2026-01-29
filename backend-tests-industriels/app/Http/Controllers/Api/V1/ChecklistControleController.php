<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChecklistControle;
use App\Models\ItemChecklist;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ChecklistControleController extends Controller
{
    /**
     * Récupérer la checklist pour un type de test donné
     */
    public function getByTypeTest(string $typeTestId): JsonResponse
    {
        $checklist = ChecklistControle::with('items')
            ->where('type_test_id', $typeTestId)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $checklist
        ]);
    }

    /**
     * Créer ou mettre à jour une checklist avec ses items
     */
    public function storeOrUpdate(Request $request, string $typeTestId): JsonResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string',
            'code_checklist' => 'required|string',
            'version' => 'required|string',
            'items' => 'required|array',
            'items.*.libelle' => 'required|string',
            'items.*.numero_item' => 'required|integer',
            'items.*.type_verif' => 'required|string',
            'items.*.valeur_reference' => 'nullable|string',
            'items.*.tolerance' => 'nullable|string',
            'items.*.obligatoire' => 'boolean',
            'items.*.criticite' => 'nullable|integer',
        ]);

        try {
            DB::beginTransaction();

            $checklist = ChecklistControle::updateOrCreate(
                ['type_test_id' => $typeTestId],
                [
                    'titre' => $validated['titre'],
                    'code_checklist' => $validated['code_checklist'],
                    'version' => $validated['version'],
                    'statut' => 'Actif',
                ]
            );

            // Supprimer les anciens items pour recréer les nouveaux (approche simple pour le designer)
            $checklist->items()->delete();

            foreach ($validated['items'] as $itemData) {
                $checklist->items()->create([
                    'id_item' => Str::uuid()->toString(),
                    'numero_item' => $itemData['numero_item'],
                    'libelle' => $itemData['libelle'],
                    'type_verif' => $itemData['type_verif'],
                    'valeur_reference' => $itemData['valeur_reference'] ?? null,
                    'tolerance' => $itemData['tolerance'] ?? null,
                    'obligatoire' => $itemData['obligatoire'] ?? true,
                    'criticite' => $itemData['criticite'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Méthode de contrôle enregistrée avec succès',
                'data' => $checklist->load('items')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement : ' . $e->getMessage()
            ], 500);
        }
    }
}

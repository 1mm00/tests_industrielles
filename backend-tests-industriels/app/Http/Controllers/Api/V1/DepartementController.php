<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Departement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartementController extends Controller
{
    /**
     * Liste des départements
     */
    public function index(Request $request): JsonResponse
    {
        $query = Departement::query();

        if ($request->filled('search')) {
            $query->where('libelle', 'like', "%{$request->search}%")
                  ->orWhere('code_departement', 'like', "%{$request->search}%");
        }

        $departements = $query->orderBy('libelle')->get();
        
        return response()->json([
            'success' => true,
            'data' => $departements
        ]);
    }

    /**
     * Créer un département
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code_departement' => 'required|string|max:20|unique:departements',
            'libelle' => 'required|string|max:100',
            'description' => 'nullable|string',
            'responsable_id' => 'nullable|uuid',
            'actif' => 'boolean'
        ]);

        $dept = Departement::create($validated);

        return response()->json([
            'success' => true,
            'data' => $dept
        ], 201);
    }

    /**
     * Mettre à jour un département
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $dept = Departement::findOrFail($id);

        $validated = $request->validate([
            'code_departement' => 'sometimes|required|string|max:20|unique:departements,code_departement,' . $id . ',id_departement',
            'libelle' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'responsable_id' => 'nullable|uuid',
            'actif' => 'boolean'
        ]);

        $dept->update($validated);

        return response()->json([
            'success' => true,
            'data' => $dept
        ]);
    }

    /**
     * Supprimer un département
     */
    public function destroy(string $id): JsonResponse
    {
        $dept = Departement::findOrFail($id);

        // Vérifier si des personnels sont rattachés
        if ($dept->personnels()->exists()) {
             return response()->json([
                'success' => false,
                'message' => 'Action bloquée : Ce département contient encore du personnel.'
            ], 422);
        }

        $dept->delete();

        return response()->json([
            'success' => true,
            'message' => 'Département supprimé'
        ]);
    }
}

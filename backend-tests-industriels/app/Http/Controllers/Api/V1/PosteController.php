<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Poste;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PosteController extends Controller
{
    /**
     * Liste des postes
     */
    public function index(Request $request): JsonResponse
    {
        $query = Poste::query();

        if ($request->filled('search')) {
            $query->where('libelle', 'like', "%{$request->search}%")
                  ->orWhere('code_poste', 'like', "%{$request->search}%");
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $postes = $query->orderBy('libelle')->get();
        
        return response()->json([
            'success' => true,
            'data' => $postes
        ]);
    }

    /**
     * Créer un poste
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code_poste' => 'required|string|max:20|unique:postes',
            'libelle' => 'required|string|max:100',
            'categorie' => 'required|string|max:50',
            'description' => 'nullable|string',
            'role_id' => 'required|uuid',
            'actif' => 'boolean'
        ]);

        $poste = Poste::create($validated);

        return response()->json([
            'success' => true,
            'data' => $poste
        ], 201);
    }

    /**
     * Mettre à jour un poste
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $poste = Poste::findOrFail($id);

        $validated = $request->validate([
            'code_poste' => 'sometimes|required|string|max:20|unique:postes,code_poste,' . $id . ',id_poste',
            'libelle' => 'sometimes|required|string|max:100',
            'categorie' => 'required|string|max:50',
            'description' => 'nullable|string',
            'role_id' => 'sometimes|required|uuid',
            'actif' => 'boolean'
        ]);

        $poste->update($validated);

        return response()->json([
            'success' => true,
            'data' => $poste
        ]);
    }

    /**
     * Supprimer un poste
     */
    public function destroy(string $id): JsonResponse
    {
        $poste = Poste::findOrFail($id);

        // Vérifier si des personnels sont rattachés
        if ($poste->personnels()->exists()) {
             return response()->json([
                'success' => false,
                'message' => 'Action bloquée : Des employés occupent encore ce poste.'
            ], 422);
        }

        $poste->delete();

        return response()->json([
            'success' => true,
            'message' => 'Poste supprimé'
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Norme;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NormeController extends Controller
{
    /**
     * Liste des normes avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = Norme::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code_norme', 'like', "%{$search}%")
                  ->orWhere('titre', 'like', "%{$search}%");
            });
        }

        if ($request->filled('categorie')) {
            $query->where('categorie', $request->categorie);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $normes = $query->orderBy('code_norme')->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $normes
        ]);
    }

    /**
     * Créer une nouvelle norme
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code_norme' => 'required|string|max:50|unique:normes',
            'titre' => 'required|string|max:255',
            'organisme_emission' => 'required|string|max:100',
            'categorie' => 'required|string|max:100',
            'version' => 'nullable|string|max:50',
            'date_publication' => 'nullable|date',
            'statut' => 'required|string',
            'description' => 'nullable|string',
            'url_reference' => 'nullable|url'
        ]);

        $norme = Norme::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Norme créée avec succès',
            'data' => $norme
        ], 201);
    }

    /**
     * Détails d'une norme
     */
    public function show(string $id): JsonResponse
    {
        $norme = Norme::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $norme
        ]);
    }

    /**
     * Mettre à jour une norme
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $norme = Norme::findOrFail($id);

        $validated = $request->validate([
            'code_norme' => 'sometimes|required|string|max:50|unique:normes,code_norme,' . $id . ',id_norme',
            'titre' => 'sometimes|required|string|max:255',
            'organisme_emission' => 'sometimes|required|string|max:100',
            'categorie' => 'sometimes|required|string|max:100',
            'version' => 'nullable|string|max:50',
            'date_publication' => 'nullable|date',
            'statut' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'url_reference' => 'nullable|url'
        ]);

        $norme->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Norme mise à jour avec succès',
            'data' => $norme
        ]);
    }

    /**
     * Supprimer une norme (avec protection intégrité via boot hook)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $norme = Norme::findOrFail($id);
            
            // On vérifie s'il y a des équipements liés (en plus du boot hook pour double sécurité)
            if ($norme->equipements()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Suppression impossible : Cette norme est référencée par des équipements.'
                ], 422);
            }

            $norme->delete();

            return response()->json([
                'success' => true,
                'message' => 'Norme supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}

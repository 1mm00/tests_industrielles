<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TypeTest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TypeTestController extends Controller
{
    /**
     * GET /api/v1/type-tests
     */
    public function index(Request $request): JsonResponse
    {
        $query = TypeTest::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('libelle', 'like', "%{$search}%")
                  ->orWhere('code_type', 'like', "%{$search}%")
                  ->orWhere('categorie_principale', 'like', "%{$search}%");
            });
        }

        if ($request->has('actif')) {
            $query->where('actif', $request->boolean('actif'));
        }

        $types = $query->orderBy('libelle')->get();
        
        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }

    /**
     * POST /api/v1/type-tests
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code_type' => 'required|string|unique:types_tests,code_type',
            'libelle' => 'required|string',
            'categorie_principale' => 'required|string|in:Standard,Obligatoire',
            'sous_categorie' => 'nullable|string',
            'description' => 'nullable|string',
            'equipements_eligibles' => 'nullable|array',
            'equipements_eligibles.*' => 'uuid',
            'niveau_criticite_defaut' => 'required|integer|between:1,4',
            'duree_estimee_jours' => 'nullable|numeric',
            'frequence_recommandee' => 'nullable|string',
            'actif' => 'boolean',
        ]);

        $typeTest = TypeTest::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Type de test créé avec succès',
            'data' => $typeTest
        ], 201);
    }

    /**
     * GET /api/v1/type-tests/{id}
     */
    public function show(string $id): JsonResponse
    {
        $typeTest = TypeTest::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $typeTest
        ]);
    }

    /**
     * PUT/PATCH /api/v1/type-tests/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $typeTest = TypeTest::findOrFail($id);

        $validated = $request->validate([
            'code_type' => 'sometimes|required|string|unique:types_tests,code_type,' . $id . ',id_type_test',
            'libelle' => 'sometimes|required|string',
            'categorie_principale' => 'sometimes|required|string|in:Standard,Obligatoire',
            'sous_categorie' => 'nullable|string',
            'description' => 'nullable|string',
            'equipements_eligibles' => 'nullable|array',
            'equipements_eligibles.*' => 'uuid',
            'niveau_criticite_defaut' => 'sometimes|required|integer|between:1,4',
            'duree_estimee_jours' => 'nullable|numeric',
            'frequence_recommandee' => 'nullable|string',
            'actif' => 'boolean',
        ]);

        $typeTest->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Type de test mis à jour avec succès',
            'data' => $typeTest
        ]);
    }

    /**
     * DELETE /api/v1/type-tests/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $typeTest = TypeTest::findOrFail($id);
        
        // Vérifier si des tests utilisent ce type
        if ($typeTest->testsIndustriels()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer ce type car il est utilisé par des tests existants.'
            ], 400);
        }

        $typeTest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Type de test supprimé avec succès'
        ]);
    }

    /**
     * GET /api/v1/type-tests/creation-data
     */
    public function creationData(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'equipements' => \App\Models\Equipement::select('id_equipement', 'designation', 'code_equipement')->get(),
            ]
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RapportTest;
use App\Models\TestIndustriel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RapportTestController extends Controller
{
    /**
     * Liste tous les rapports
     */
    public function index(Request $request)
    {
        $query = RapportTest::with(['test.typeTest', 'test.equipement', 'redacteur', 'valideur']);

        // Filtres
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('numero_rapport', 'LIKE', "%{$search}%")
                  ->orWhereHas('test', function($testQuery) use ($search) {
                      $testQuery->where('numero_test', 'LIKE', "%{$search}%");
                  });
            });
        }

        $rapports = $query->latest('date_edition')->paginate($request->per_page ?? 10);

        return response()->json($rapports);
    }

    /**
     * Récupère un rapport avec TOUTES ses données pour génération PDF
     */
    public function getMasterReportData($id)
    {
        try {
            $rapport = RapportTest::with([
                'test' => function($query) {
                    $query->with([
                        'typeTest',
                        'equipement',
                        'mesures',
                        'nonConformites',
                    ]);
                },
                'redacteur',
                'valideur'
            ])->findOrFail($id);

            // Enrichir avec des stats calculées
            $test = $rapport->test;
            
            $mesures = $test->mesures ?? collect([]);
            $nonConformites = $test->nonConformites ?? collect([]);
            
            $data = [
                'rapport' => $rapport,
                'test' => $test,
                'meta' => [
                    'total_mesures' => $mesures->count(),
                    'mesures_conformes' => $mesures->where('conforme', true)->count(),
                    'total_nc' => $nonConformites->count(),
                    'nc_critiques' => $nonConformites->where('criticite', 'A')->count(),
                    'duree_reelle' => $test->duree_reelle_heures ?? 0,
                ],
                'historique_versions' => $rapport->structure_rapport['versions'] ?? [],
                'references_documentaires' => $rapport->structure_rapport['references'] ?? [],
                'description_systeme' => $rapport->structure_rapport['systeme'] ?? '',
                'perimetre_tests' => $rapport->structure_rapport['perimetre'] ?? '',
                'environnement' => $rapport->structure_rapport['environnement'] ?? '',
                'strategie' => $rapport->structure_rapport['strategie'] ?? '',
                'conclusion' => $rapport->resume_executif ?? '',
                'recommandations' => $rapport->structure_rapport['recommandations'] ?? '',
            ];

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des données du rapport',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau rapport
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'test_id' => 'required|exists:tests_industriels,id_test',
            'type_rapport' => 'required|string',
            'titre_rapport' => 'nullable|string|max:255',
            'recommandations' => 'nullable|string',
            'resume_executif' => 'nullable|string',
            'structure_rapport' => 'nullable|array',
        ]);

        $validated['numero_rapport'] = $this->genererNumeroRapport();
        $validated['date_edition'] = now();
        $validated['redacteur_id'] = auth()->user()->personnel->id_personnel ?? null;
        $validated['statut'] = 'BROUILLON';

        $rapport = RapportTest::create($validated);
        $rapport->load(['test', 'redacteur']);

        return response()->json($rapport, 201);
    }

    /**
     * Récupère un rapport spécifique
     */
    public function show($id)
    {
        $rapport = RapportTest::with(['test.equipement', 'redacteur', 'valideur'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $rapport
        ]);
    }

    /**
     * Mettre à jour un rapport
     */
    public function update(Request $request, $id)
    {
        $rapport = RapportTest::findOrFail($id);

        $validated = $request->validate([
            'resume_executif' => 'nullable|string',
            'recommandations' => 'nullable|string',
            'titre_rapport' => 'nullable|string|max:255',
            'structure_rapport' => 'nullable|array',
            'statut' => 'nullable|in:BROUILLON,EN_REVISION,VALIDE',
        ]);

        $rapport->update($validated);

        return response()->json($rapport);
    }

    /**
     * Supprimer un rapport
     */
    public function destroy($id)
    {
        $rapport = RapportTest::findOrFail($id);
        $rapport->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rapport supprimé avec succès'
        ]);
    }

    /**
     * Générer et télécharger le rapport en PDF
     */
    public function downloadPdf($id)
    {
        try {
            $rapport = RapportTest::with([
                'test.typeTest',
                'test.equipement',
                'test.mesures',
                'redacteur.role',
                'valideur.role'
            ])->findOrFail($id);

            $data = [
                'rapport' => $rapport,
                'test' => $rapport->test,
                'redacteur' => $rapport->redacteur,
                'valideur' => $rapport->valideur,
                'equipement' => $rapport->test->equipement,
                'mesures' => $rapport->test->mesures,
                'date' => now()->format('d/m/Y H:i')
            ];

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.technical_report', $data)
                ->setPaper('a4', 'portrait');

            return $pdf->download($rapport->numero_rapport . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la génération du PDF',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Valider un rapport
     */
    public function valider($id)
    {
        $rapport = RapportTest::findOrFail($id);

        $rapport->update([
            'statut' => 'VALIDE',
            'valideur_id' => auth()->user()->personnel->id_personnel ?? null,
            'date_validation' => now(),
        ]);

        return response()->json($rapport);
    }

    /**
     * Obtenir les statistiques des rapports
     */
    public function getStats()
    {
        $stats = [
            'total' => RapportTest::count(),
            'valides' => RapportTest::where('statut', 'VALIDE')->count(),
            'en_revision' => RapportTest::where('statut', 'EN_REVISION')->count(),
            'brouillons' => RapportTest::where('statut', 'BROUILLON')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Générer un numéro de rapport unique
     */
    private function genererNumeroRapport(): string
    {
        $annee = date('Y');
        $dernier = RapportTest::where('numero_rapport', 'LIKE', "RPT-{$annee}-%")
            ->orderBy('numero_rapport', 'desc')
            ->first();

        if ($dernier) {
            $dernierNumero = (int) substr($dernier->numero_rapport, -4);
            $nouveauNumero = str_pad($dernierNumero + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nouveauNumero = '0001';
        }

        return "RPT-{$annee}-{$nouveauNumero}";
    }
}

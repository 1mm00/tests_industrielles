<?php

namespace App\Services;

use App\Models\TestIndustriel;
use App\Models\Mesure;
use App\Enums\TestStatutEnum;
use App\Enums\TestResultatEnum;
use App\Enums\EquipementStatutEnum;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TestIndustrielService
{
    /**
     * Créer un nouveau test
     */
    public function creerTest(array $data): TestIndustriel
    {
        // Le numero_test sera généré automatiquement via le boot() du model
        $test = TestIndustriel::create($data);
        
        return $test;
    }

    /**
     * Démarrer un test
     */
    public function demarrerTest(string $testId): TestIndustriel
    {
        $test = TestIndustriel::findOrFail($testId);
        
        if ($test->statut_test !== TestStatutEnum::PLANIFIE) {
            throw new \Exception("Le test doit être en statut 'Planifié' pour être démarré.");
        }
        
        $test->demarrer();
        
        return $test->fresh();
    }

    /**
     * Terminer un test avec calculs automatiques
     */
    public function terminerTest(string $testId): TestIndustriel
    {
        $test = TestIndustriel::findOrFail($testId);
        
        if ($test->statut_test !== TestStatutEnum::EN_COURS) {
            throw new \Exception("Le test doit être 'En cours' pour être terminé.");
        }
        
        $test->terminer(); // Logique dans le model
        
        return $test->fresh();
    }

    /**
     * Obtenir les tests en cours
     */
    public function getTestsEnCours(): Collection
    {
        return TestIndustriel::enCours()
            ->with(['equipement', 'typeTest', 'responsable'])
            ->orderBy('date_test', 'desc')
            ->get();
    }

    /**
     * Obtenir tous les tests avec pagination et filtres
     */
    public function getPaginatedTests(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = TestIndustriel::query()
            ->with(['equipement', 'typeTest', 'responsable'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('numero_test', 'like', "%{$search}%")
                  ->orWhereHas('equipement', function ($qe) use ($search) {
                      $qe->where('designation', 'like', "%{$search}%")
                        ->orWhere('code_equipement', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut_test', $filters['statut']);
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }

    /**
     * Obtenir les tests non conformes d'une période
     */
    public function getTestsNonConformes(Carbon $dateDebut, Carbon $dateFin): Collection
    {
        return TestIndustriel::nonConformes()
            ->parPeriode($dateDebut, $dateFin)
            ->with(['equipement', 'nonConformites'])
            ->get();
    }

    /**
     * Statistiques tests par équipement
     */
    public function statistiquesParEquipement(string $equipementId, Carbon $dateDebut, Carbon $dateFin): array
    {
        $tests = TestIndustriel::parEquipement($equipementId)
            ->parPeriode($dateDebut, $dateFin)
            ->get();

        $total = $tests->count();
        $conformes = $tests->where('resultat_global', TestResultatEnum::CONFORME)->count();
        $nonConformes = $tests->where('resultat_global', TestResultatEnum::NON_CONFORME)->count();
        $partiels = $tests->where('resultat_global', TestResultatEnum::PARTIEL)->count();

        return [
            'total_tests' => $total,
            'conformes' => $conformes,
            'non_conformes' => $nonConformes,
            'partiels' => $partiels,
            'taux_conformite' => $total > 0 ? round(($conformes / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Générer rapport de synthèse test
     */
    public function genererRapportSynthese(string $testId): array
    {
        $test = TestIndustriel::with([
            'equipement',
            'typeTest',
            'responsable',
            'mesures',
            'resultats',
            'observations',
            'nonConformites'
        ])->findOrFail($testId);

        return [
            'test' => $test,
            'synthese' => [
                'nombre_mesures' => $test->mesures->count(),
                'mesures_conformes' => $test->mesures->where('conforme', true)->count(),
                'nombre_nc' => $test->nonConformites->count(),
                'duree_effective' => $test->duree_reelle_heures,
                'taux_conformite' => $test->taux_conformite_pct,
            ]
        ];
    }

    /**
     * Obtenir les statistiques globales pour le dashboard
     */
    public function getGlobalStats(): array
    {
        // 1. Statistiques de base
        $totalTests = TestIndustriel::count();
        $testsEnCours = TestIndustriel::where('statut', 'EN_COURS')->count();
        $ncOuvertes = \App\Models\NonConformite::where('statut', 'OUVERTE')->count();
        $ncCritiques = \App\Models\NonConformite::whereHas('criticite', function($q) {
            $q->where('code_niveau', 'LIKE', '%L3%')->orWhere('code_niveau', 'LIKE', '%L4%');
        })->count();

        // 2. Évolution industrielle (6 derniers mois)
        $evolutionData = [];
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M');
            $months[] = $monthName;
            
            $evolutionData['tests'][] = TestIndustriel::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)->count();
            
            $evolutionData['conformes'][] = TestIndustriel::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->where('resultat_global', 'CONFORME')->count();

            $evolutionData['nc'][] = \App\Models\NonConformite::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)->count();
        }

        // 3. Répartition des NC par statut
        $ncDist = \App\Models\NonConformite::selectRaw('statut, count(*) as count')
            ->groupBy('statut')
            ->pluck('count', 'statut')
            ->toArray();

        // 4. Derniers tests et NC pour les listes du dashboard
        $recentTests = TestIndustriel::with('equipement')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentNc = \App\Models\NonConformite::with(['criticite', 'equipement'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return [
            'totalTests' => $totalTests,
            'testsEnCours' => $testsEnCours,
            'ncOuvertes' => $ncOuvertes,
            'ncCritiques' => $ncCritiques,
            'tauxConformite' => $totalTests > 0 ? (float) round((TestIndustriel::where('resultat_global', 'CONFORME')->count() / $totalTests) * 100, 1) : 0,
            'industrial_evolution' => [
                'series' => [
                    ['name' => 'Tests Réalisés', 'type' => 'column', 'data' => $evolutionData['tests']],
                    ['name' => 'Tests Conformes', 'type' => 'area', 'data' => $evolutionData['conformes']],
                    ['name' => 'Non-Conformités', 'type' => 'line', 'data' => $evolutionData['nc']],
                ],
                'categories' => $months
            ],
            'nc_distribution' => [
                'series' => array_values($ncDist),
                'labels' => array_keys($ncDist)
            ],
            'recent_tests' => $recentTests,
            'recent_nc' => $recentNc
        ];
    }
    /**
     * Obtenir les données nécessaires pour la création d'un test
     */
    public function getCreationData(): array
    {
        $personnels = \App\Models\Personnel::select('id_personnel', 'nom', 'prenom')->get();
        
        // Fallback pour le développement si la table personnels est vide
        if ($personnels->isEmpty()) {
            $personnels = \App\Models\User::all()->map(function($user) {
                return [
                    'id_personnel' => $user->id, // On simule l'ID
                    'nom' => $user->name,
                    'prenom' => '',
                ];
            });
        }

        return [
            'equipements' => \App\Models\Equipement::select('id_equipement', 'designation', 'code_equipement')->get(),
            'types_tests' => \App\Models\TypeTest::select('id_type_test', 'libelle', 'code_type')->orderBy('libelle')->get(),
            'phases' => \App\Models\PhaseTest::select('id_phase', 'nom_phase')->orderBy('ordre_execution')->get(),
            'personnels' => $personnels,
        ];
    }

    public function getCalendarTests(int $month = null, int $year = null): Collection
    {
        $month = $month ?? now()->month;
        $year = $year ?? now()->year;

        return TestIndustriel::whereMonth('date_test', $month)
            ->whereYear('date_test', $year)
            ->with(['equipement', 'typeTest', 'responsable'])
            ->orderBy('date_test', 'asc')
            ->get();
    }
}

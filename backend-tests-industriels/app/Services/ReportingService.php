<?php

namespace App\Services;

use App\Models\TestIndustriel;
use App\Models\NonConformite;
use App\Models\Equipement;
use App\Models\RapportTest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    /**
     * Obtenir les données de performance globale (KPIs)
     */
    public function getPerformanceStats(): array
    {
        $now = now();
        $sixMonthsAgo = now()->subMonths(6);

        // 1. Taux de conformité mensuel
        $monthlyConformity = [];
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthLabel = $date->format('M Y');
            $months[] = $monthLabel;

            $total = TestIndustriel::whereYear('date_test', $date->year)
                ->whereMonth('date_test', $date->month)
                ->count();
            
            $conformes = TestIndustriel::whereYear('date_test', $date->year)
                ->whereMonth('date_test', $date->month)
                ->where('resultat_global', 'CONFORME')
                ->count();

            $monthlyConformity[] = $total > 0 ? round(($conformes / $total) * 100, 1) : 0;
        }

        // 2. Distribution par Type de Test
        $testTypeDistribution = DB::table('tests_industriels')
            ->join('types_tests', 'tests_industriels.id_type_test', '=', 'types_tests.id_type_test')
            ->select('types_tests.libelle as label', DB::raw('count(*) as value'))
            ->groupBy('types_tests.libelle')
            ->orderBy('value', 'desc')
            ->get();

        // 3. Top Equipements avec Non-Conformités
        $topEquipementIssues = DB::table('non_conformites')
            ->join('equipements', 'non_conformites.id_equipement', '=', 'equipements.id_equipement')
            ->select('equipements.designation as label', DB::raw('count(*) as value'))
            ->groupBy('equipements.designation')
            ->orderBy('value', 'desc')
            ->take(5)
            ->get();

        // 4. Délai moyen de résolution des NC (clôturées)
        $avgResolutionTime = NonConformite::where('statut', 'CLOTUREE')
            ->whereNotNull('date_cloture')
            ->selectRaw('AVG(DATEDIFF(date_cloture, date_detection)) as avg_days')
            ->value('avg_days');

        // 5. Tendances (Comparaison par rapport au mois dernier)
        $lastMonth = now()->subMonth();
        $prevConformity = $this->getConformityRateForMonth($lastMonth->month, $lastMonth->year);
        $currConformity = $this->getGlobalConformityRate();
        
        $prevNC = NonConformite::whereDate('created_at', '<', now()->startOfMonth())->whereIn('statut', ['OUVERTE', 'EN_COURS'])->count();
        $currNC = NonConformite::whereIn('statut', ['OUVERTE', 'EN_COURS'])->count();

        return [
            'summary' => [
                'conformity_rate' => [
                    'value' => $currConformity,
                    'trend' => $currConformity >= $prevConformity ? 'up' : 'down',
                    'change' => round(abs($currConformity - $prevConformity), 1) . '%'
                ],
                'avg_resolution_days' => round($avgResolutionTime ?? 0, 1),
                'total_nc_active' => [
                    'value' => $currNC,
                    'trend' => $currNC <= $prevNC ? 'down' : 'up', // Down is good for active NC
                    'change' => abs($currNC - $prevNC)
                ],
                'critical_nc_count' => [
                    'value' => NonConformite::whereHas('criticite', function($q) {
                        $q->where('code_niveau', 'NC3')->orWhere('code_niveau', 'NC4');
                    })->count(),
                    'trend' => 'neutral',
                    'change' => '0'
                ],
                'total_tests' => [
                    'value' => TestIndustriel::count(),
                    'trend' => 'up',
                    'change' => '+1.2%'
                ]
            ],
            'conformity_trend' => [
                'categories' => $months,
                'series' => [
                    ['name' => 'Taux Conformité (%)', 'data' => $monthlyConformity]
                ]
            ],
            'test_types' => $testTypeDistribution,
            'top_issues' => $topEquipementIssues,
            'nc_by_criticality' => $this->getNcCriticalityDistribution()
        ];
    }

    private function getConformityRateForMonth($month, $year): float
    {
        $total = TestIndustriel::whereYear('date_test', $year)->whereMonth('date_test', $month)->count();
        if ($total === 0) return 0;
        $conformes = TestIndustriel::whereYear('date_test', $year)->whereMonth('date_test', $month)
            ->where('resultat_global', 'CONFORME')->count();
        return round(($conformes / $total) * 100, 1);
    }


    private function getGlobalConformityRate(): float
    {
        $total = TestIndustriel::count();
        if ($total === 0) return 0;
        
        $conformes = TestIndustriel::where('resultat_global', 'CONFORME')->count();
        return round(($conformes / $total) * 100, 1);
    }

    private function getNcCriticalityDistribution(): array
    {
        return NonConformite::selectRaw('criticite_id, count(*) as count')
            ->with('criticite')
            ->groupBy('criticite_id')
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->criticite ? $item->criticite->code_niveau : 'Inconnu',
                    'value' => $item->count,
                    'color' => $item->criticite ? $item->criticite->couleur_indicateur : '#94a3b8'
                ];
            })->toArray();
    }

    /**
     * Obtenir la liste des rapports générés
     */
    public function getReportsList(): \Illuminate\Database\Eloquent\Collection
    {
        return RapportTest::with(['test.equipement', 'redacteur'])
            ->orderBy('date_edition', 'desc')
            ->get();
    }

    /**
     * Créer un nouveau rapport
     */
    public function createReport(array $data): RapportTest
    {
        // Générer un numéro de rapport unique
        $test = TestIndustriel::findOrFail($data['test_id']);
        $numeroRapport = 'REP-' . $test->numero_test . '-' . strtoupper(substr(uniqid(), -4));

        return RapportTest::create([
            'test_id' => $data['test_id'],
            'numero_rapport' => $numeroRapport,
            'type_rapport' => $data['type_rapport'],
            'date_edition' => $data['date_edition'],
            'redacteur_id' => $data['redacteur_id'],
            'statut' => 'BROUILLON', // Par défaut
            'resume_executif' => $data['resume_executif'] ?? 'Résumé non fourni.',
        ]);
    }

    /**
     * Exécuter une requête dynamique pour le reporting personnalisé
     */
    public function customQuery(array $params): array
    {
        $metric = $params['metric'] ?? 'tests_count';
        $dimension = $params['dimension'] ?? 'date_test';
        $startDate = isset($params['start_date']) ? Carbon::parse($params['start_date']) : now()->subMonths(6);
        $endDate = isset($params['end_date']) ? Carbon::parse($params['end_date']) : now();

        $query = null;
        $select = [];
        $groupBy = [];

        // Configuration de la dimension
        switch ($dimension) {
            case 'date_test':
                $dimensionSelect = DB::raw("TO_CHAR(date_test, 'YYYY-MM') as x");
                $groupBy = ['x'];
                break;
            case 'type_test':
                $dimensionSelect = 'types_tests.libelle as x';
                $groupBy = ['types_tests.libelle'];
                break;
            case 'equipement':
                $dimensionSelect = 'equipements.designation as x';
                $groupBy = ['equipements.designation'];
                break;
            case 'criticite':
                $dimensionSelect = 'niveaux_criticite.libelle as x';
                $groupBy = ['niveaux_criticite.libelle'];
                break;
            default:
                $dimensionSelect = DB::raw("TO_CHAR(date_test, 'YYYY-MM') as x");
                $groupBy = ['x'];
        }

        // Base Query & Metric calculation
        if ($metric === 'nc_count') {
            $query = DB::table('non_conformites');
            if ($dimension === 'criticite') {
                $query->join('niveaux_criticite', 'non_conformites.criticite_id', '=', 'niveaux_criticite.id_niveau_criticite');
            } elseif ($dimension === 'equipement') {
                $query->join('equipements', 'non_conformites.id_equipement', '=', 'equipements.id_equipement');
            }
            $query->whereBetween('date_detection', [$startDate, $endDate]);
            $select = [$dimensionSelect, DB::raw('count(*) as y')];
        } else {
            $query = DB::table('tests_industriels');
            if ($dimension === 'type_test') {
                $query->join('types_tests', 'tests_industriels.id_type_test', '=', 'types_tests.id_type_test');
            } elseif ($dimension === 'equipement') {
                $query->join('equipements', 'tests_industriels.id_equipement', '=', 'equipements.id_equipement');
            }
            $query->whereBetween('date_test', [$startDate, $endDate]);

            if ($metric === 'conformity_rate') {
                $select = [
                    $dimensionSelect,
                    DB::raw("ROUND(SUM(CASE WHEN resultat_global = 'CONFORME' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as y")
                ];
            } else { // tests_count
                $select = [$dimensionSelect, DB::raw('count(*) as y')];
            }
        }

        $results = $query->select($select)
            ->groupBy($groupBy)
            ->orderBy('x')
            ->get();

        return [
            'labels' => $results->pluck('x'),
            'values' => $results->pluck('y'),
            'metric' => $metric,
            'dimension' => $dimension
        ];
    }

    /**
     * Sauvegarder une vue en favori
     */
    public function saveFavorite(array $data): \App\Models\ReportingFavorite
    {
        return \App\Models\ReportingFavorite::create($data);
    }

    /**
     * Récupérer les favoris d'un utilisateur
     */
    public function getUserFavorites(string $userId)
    {
        return \App\Models\ReportingFavorite::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Supprimer un favori
     */
    public function deleteFavorite(string $id, string $userId): bool
    {
        return \App\Models\ReportingFavorite::where('id', $id)
            ->where('user_id', $userId)
            ->delete();
    }
}
